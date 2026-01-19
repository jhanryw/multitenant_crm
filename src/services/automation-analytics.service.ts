import { createClient } from '@/lib/supabase/client';

export interface AutomationAnalytics {
  totalExecutions: number;
  successRate: number;
  averageResponseTime: number;
  failureCount: number;
  mostActiveRule: string;
  totalRules: number;
}

export interface ExecutionTrend {
  date: string;
  executions: number;
  successful: number;
  failed: number;
}

export interface RulePerformance {
  ruleId: string;
  ruleName: string;
  triggerType: string;
  actionType: string;
  executions: number;
  successRate: number;
  averageTime: number;
  lastExecuted: string;
}

export interface LeadTransferPattern {
  fromStatus: string;
  toStatus: string;
  count: number;
  automationDriven: number;
  manualChanges: number;
}

export interface TimingAnalytics {
  hour: number;
  executions: number;
  successRate: number;
}

export interface RecentActivity {
  id: string;
  automationName: string;
  leadName: string;
  executedAt: string;
  success: boolean;
  errorMessage?: string;
  executionTime?: number;
}

export interface OptimizationRecommendation {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  ruleId?: string;
  priority: 'high' | 'medium' | 'low';
}

export const automationAnalyticsService = {
  async getOverallAnalytics(companyId: string, startDate?: Date, endDate?: Date): Promise<AutomationAnalytics> {
    const supabase = createClient();
    
    try {
      let query = supabase
        .from('automation_logs')
        .select(`
          id,
          success,
          executed_at,
          execution_details,
          lead_automations!inner(company_id, name)
        `)
        .eq('lead_automations.company_id', companyId);

      if (startDate) {
        query = query.gte('executed_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('executed_at', endDate.toISOString());
      }

      const { data: logs, error } = await query;

      if (error) throw error;

      const totalExecutions = logs?.length || 0;
      const successCount = logs?.filter(log => log.success).length || 0;
      const failureCount = totalExecutions - successCount;
      const successRate = totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0;

      // Calculate average response time from execution_details
      const timings = logs
        ?.map(log => log.execution_details?.executionTime)
        .filter((time): time is number => typeof time === 'number') || [];
      const averageResponseTime = timings.length > 0 
        ? timings.reduce((sum, time) => sum + time, 0) / timings.length 
        : 0;

      // Find most active rule
      const ruleCounts: Record<string, number> = {};
      logs?.forEach(log => {
        const ruleName = (log.lead_automations as any)?.name;
        if (ruleName) {
          ruleCounts[ruleName] = (ruleCounts[ruleName] || 0) + 1;
        }
      });
      const mostActiveRule = Object.keys(ruleCounts).length > 0
        ? Object.entries(ruleCounts).sort(([, a], [, b]) => b - a)[0][0]
        : 'N/A';

      // Get total rules count
      const { count: totalRules } = await supabase
        .from('lead_automations')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      return {
        totalExecutions,
        successRate: Math.round(successRate * 10) / 10,
        averageResponseTime: Math.round(averageResponseTime),
        failureCount,
        mostActiveRule,
        totalRules: totalRules || 0
      };
    } catch (error) {
      console.error('Error fetching automation analytics:', error);
      throw error;
    }
  },

  async getExecutionTrends(companyId: string, days: number = 30): Promise<ExecutionTrend[]> {
    const supabase = createClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const { data: logs, error } = await supabase
        .from('automation_logs')
        .select(`
          executed_at,
          success,
          lead_automations!inner(company_id)
        `)
        .eq('lead_automations.company_id', companyId)
        .gte('executed_at', startDate.toISOString())
        .order('executed_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const trendMap: Record<string, { executions: number; successful: number; failed: number }> = {};
      
      logs?.forEach(log => {
        const date = new Date(log.executed_at!).toLocaleDateString('pt-BR');
        if (!trendMap[date]) {
          trendMap[date] = { executions: 0, successful: 0, failed: 0 };
        }
        trendMap[date].executions++;
        if (log.success) {
          trendMap[date].successful++;
        } else {
          trendMap[date].failed++;
        }
      });

      return Object.entries(trendMap).map(([date, data]) => ({
        date,
        ...data
      }));
    } catch (error) {
      console.error('Error fetching execution trends:', error);
      throw error;
    }
  },

  async getRulePerformance(companyId: string, startDate?: Date, endDate?: Date): Promise<RulePerformance[]> {
    const supabase = createClient();

    try {
      const { data: rules, error: rulesError } = await supabase
        .from('lead_automations')
        .select('*')
        .eq('company_id', companyId);

      if (rulesError) throw rulesError;

      const performanceData: RulePerformance[] = [];

      for (const rule of rules || []) {
        let logQuery = supabase
          .from('automation_logs')
          .select('*')
          .eq('automation_id', rule.id);

        if (startDate) {
          logQuery = logQuery.gte('executed_at', startDate.toISOString());
        }
        if (endDate) {
          logQuery = logQuery.lte('executed_at', endDate.toISOString());
        }

        const { data: logs } = await logQuery;

        const executions = logs?.length || 0;
        const successful = logs?.filter(log => log.success).length || 0;
        const successRate = executions > 0 ? (successful / executions) * 100 : 0;

        const timings = logs
          ?.map(log => log.execution_details?.executionTime)
          .filter((time): time is number => typeof time === 'number') || [];
        const averageTime = timings.length > 0
          ? timings.reduce((sum, time) => sum + time, 0) / timings.length
          : 0;

        const lastExecuted = logs && logs.length > 0
          ? new Date(Math.max(...logs.map(log => new Date(log.executed_at!).getTime()))).toISOString()
          : '';

        performanceData.push({
          ruleId: rule.id,
          ruleName: rule.name,
          triggerType: rule.trigger_type,
          actionType: rule.action_type,
          executions,
          successRate: Math.round(successRate * 10) / 10,
          averageTime: Math.round(averageTime),
          lastExecuted
        });
      }

      return performanceData.sort((a, b) => b.executions - a.executions);
    } catch (error) {
      console.error('Error fetching rule performance:', error);
      throw error;
    }
  },

  async getLeadTransferPatterns(companyId: string, startDate?: Date, endDate?: Date): Promise<LeadTransferPattern[]> {
    const supabase = createClient();

    try {
      // Get automation-driven status changes
      let logsQuery = supabase
        .from('automation_logs')
        .select(`
          id,
          success,
          execution_details,
          lead_automations!inner(company_id, action_type, action_config)
        `)
        .eq('lead_automations.company_id', companyId)
        .eq('success', true);

      if (startDate) {
        logsQuery = logsQuery.gte('executed_at', startDate.toISOString());
      }
      if (endDate) {
        logsQuery = logsQuery.lte('executed_at', endDate.toISOString());
      }

      const { data: logs, error: logsError } = await logsQuery;
      if (logsError) throw logsError;

      // Track status transitions
      const patterns: Record<string, LeadTransferPattern> = {};

      logs?.forEach(log => {
        const automation = log.lead_automations as any;
        if (automation?.action_type === 'change_status') {
          const fromStatus = log.execution_details?.previousStatus || 'unknown';
          const toStatus = automation?.action_config?.newStatus || 'unknown';
          const key = `${fromStatus}->${toStatus}`;

          if (!patterns[key]) {
            patterns[key] = {
              fromStatus,
              toStatus,
              count: 0,
              automationDriven: 0,
              manualChanges: 0
            };
          }
          patterns[key].count++;
          patterns[key].automationDriven++;
        }
      });

      return Object.values(patterns).sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error fetching lead transfer patterns:', error);
      throw error;
    }
  },

  async getTimingAnalytics(companyId: string, days: number = 7): Promise<TimingAnalytics[]> {
    const supabase = createClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const { data: logs, error } = await supabase
        .from('automation_logs')
        .select(`
          executed_at,
          success,
          lead_automations!inner(company_id)
        `)
        .eq('lead_automations.company_id', companyId)
        .gte('executed_at', startDate.toISOString());

      if (error) throw error;

      // Group by hour
      const hourlyData: Record<number, { executions: number; successful: number }> = {};
      
      for (let i = 0; i < 24; i++) {
        hourlyData[i] = { executions: 0, successful: 0 };
      }

      logs?.forEach(log => {
        const hour = new Date(log.executed_at!).getHours();
        hourlyData[hour].executions++;
        if (log.success) {
          hourlyData[hour].successful++;
        }
      });

      return Object.entries(hourlyData).map(([hour, data]) => ({
        hour: parseInt(hour),
        executions: data.executions,
        successRate: data.executions > 0 ? (data.successful / data.executions) * 100 : 0
      }));
    } catch (error) {
      console.error('Error fetching timing analytics:', error);
      throw error;
    }
  },

  async getRecentActivities(companyId: string, limit: number = 20): Promise<RecentActivity[]> {
    const supabase = createClient();

    try {
      const { data: logs, error } = await supabase
        .from('automation_logs')
        .select(`
          id,
          executed_at,
          success,
          error_message,
          execution_details,
          lead_automations!inner(name, company_id),
          leads(name)
        `)
        .eq('lead_automations.company_id', companyId)
        .order('executed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return logs?.map(log => ({
        id: log.id,
        automationName: (log.lead_automations as any)?.name || 'Unknown',
        leadName: (log.leads as any)?.name || 'Unknown Lead',
        executedAt: log.executed_at!,
        success: log.success,
        errorMessage: log.error_message || undefined,
        executionTime: log.execution_details?.executionTime
      })) || [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  async getOptimizationRecommendations(companyId: string): Promise<OptimizationRecommendation[]> {
    const supabase = createClient();
    const recommendations: OptimizationRecommendation[] = [];

    try {
      // Check for inactive rules
      const { data: inactiveRules } = await supabase
        .from('lead_automations')
        .select('id, name')
        .eq('company_id', companyId)
        .eq('is_active', false);

      if (inactiveRules && inactiveRules.length > 0) {
        recommendations.push({
          type: 'info',
          title: 'Regras inativas detectadas',
          description: `${inactiveRules.length} regra(s) de automação estão inativas e não estão sendo executadas.`,
          priority: 'low'
        });
      }

      // Check for rules with high failure rates
      const { data: rules } = await supabase
        .from('lead_automations')
        .select('id, name')
        .eq('company_id', companyId)
        .eq('is_active', true);

      for (const rule of rules || []) {
        const { data: logs } = await supabase
          .from('automation_logs')
          .select('success')
          .eq('automation_id', rule.id)
          .gte('executed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const total = logs?.length || 0;
        const failed = logs?.filter(log => !log.success).length || 0;
        const failureRate = total > 0 ? (failed / total) * 100 : 0;

        if (failureRate > 30 && total >= 5) {
          recommendations.push({
            type: 'warning',
            title: 'Taxa de falha elevada',
            description: `A regra "${rule.name}" tem ${failureRate.toFixed(1)}% de falhas nos últimos 7 dias.`,
            ruleId: rule.id,
            priority: 'high'
          });
        }
      }

      // Check for rules with no recent activity
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      for (const rule of rules || []) {
        const { data: recentLogs } = await supabase
          .from('automation_logs')
          .select('id')
          .eq('automation_id', rule.id)
          .gte('executed_at', sevenDaysAgo.toISOString())
          .limit(1);

        if (!recentLogs || recentLogs.length === 0) {
          recommendations.push({
            type: 'info',
            title: 'Regra sem atividade recente',
            description: `A regra "${rule.name}" não foi executada nos últimos 7 dias.`,
            ruleId: rule.id,
            priority: 'medium'
          });
        }
      }

      return recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    } catch (error) {
      console.error('Error generating optimization recommendations:', error);
      return [];
    }
  }
};