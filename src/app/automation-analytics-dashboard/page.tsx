'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import MobileSidebar from '@/components/common/MobileSidebar';
import { 
  ChartBarIcon, 
  ClockIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { automationAnalyticsService } from '@/services/automation-analytics.service';

export default function AutomationAnalyticsDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);
  const [analytics, setAnalytics] = useState<any>(null);
  const [executionTrends, setExecutionTrends] = useState<any[]>([]);
  const [rulePerformance, setRulePerformance] = useState<any[]>([]);
  const [transferPatterns, setTransferPatterns] = useState<any[]>([]);
  const [timingData, setTimingData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    if (user?.company_id) {
      loadAnalyticsData();
    }
  }, [user?.company_id, dateRange]);

  const loadAnalyticsData = async () => {
    if (!user?.company_id) return;

    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const [
        analyticsData,
        trendsData,
        performanceData,
        patternsData,
        timingAnalytics,
        activities,
        recs
      ] = await Promise.all([
        automationAnalyticsService.getOverallAnalytics(user.company_id, startDate),
        automationAnalyticsService.getExecutionTrends(user.company_id, dateRange),
        automationAnalyticsService.getRulePerformance(user.company_id, startDate),
        automationAnalyticsService.getLeadTransferPatterns(user.company_id, startDate),
        automationAnalyticsService.getTimingAnalytics(user.company_id, 7),
        automationAnalyticsService.getRecentActivities(user.company_id, 10),
        automationAnalyticsService.getOptimizationRecommendations(user.company_id)
      ]);

      setAnalytics(analyticsData);
      setExecutionTrends(trendsData);
      setRulePerformance(performanceData);
      setTransferPatterns(patternsData);
      setTimingData(timingAnalytics);
      setRecentActivities(activities);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Generate comprehensive report data
    const reportData = {
      analytics,
      executionTrends,
      rulePerformance,
      transferPatterns,
      timingData,
      recentActivities,
      recommendations,
      generatedAt: new Date().toLocaleString('pt-BR')
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `automation-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#1fc2a9', '#107c65', '#0d5f4d', '#60c5b1', '#3fb09e'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex">
          <Sidebar />
          <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <ArrowPathIcon className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Carregando análises de automação...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <Sidebar />
        <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-4 lg:p-8">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Análise de Automações
                </h1>
                <p className="text-gray-600 mt-1">
                  Desempenho e insights de regras de automação
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value={7}>Últimos 7 dias</option>
                  <option value={30}>Últimos 30 dias</option>
                  <option value={90}>Últimos 90 dias</option>
                </select>
                
                <button
                  onClick={exportReport}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Exportar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Execuções</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analytics?.totalExecutions?.toLocaleString('pt-BR') || 0}
                  </p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-teal-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {analytics?.successRate?.toFixed(1) || 0}%
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tempo Médio</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {analytics?.averageResponseTime || 0}ms
                  </p>
                </div>
                <ClockIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Falhas</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {analytics?.failureCount || 0}
                  </p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Regras Ativas</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {analytics?.totalRules || 0}
                  </p>
                </div>
                <ArrowPathIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mais Ativa</p>
                  <p className="text-sm font-bold text-gray-900 mt-1 truncate">
                    {analytics?.mostActiveRule || 'N/A'}
                  </p>
                </div>
                <ArrowTrendingUpIcon className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Execution Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tendência de Execuções
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={executionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="executions" stroke="#1fc2a9" name="Total" />
                  <Line type="monotone" dataKey="successful" stroke="#10b981" name="Sucesso" />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Falhas" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Timing Analytics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Distribuição por Horário
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" label={{ value: 'Hora', position: 'insideBottom', offset: -5 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="executions" fill="#1fc2a9" name="Execuções" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rule Performance & Transfer Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Rule Performance */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance por Regra
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {rulePerformance.map((rule, index) => (
                  <div key={rule.ruleId} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{rule.ruleName}</p>
                        <p className="text-sm text-gray-500">
                          {rule.triggerType} → {rule.actionType}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        rule.successRate >= 80 ? 'bg-green-100 text-green-800' :
                        rule.successRate >= 60 ? 'bg-yellow-100 text-yellow-800': 'bg-red-100 text-red-800'
                      }`}>
                        {rule.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Execuções</p>
                        <p className="font-semibold">{rule.executions}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tempo Médio</p>
                        <p className="font-semibold">{rule.averageTime}ms</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Última</p>
                        <p className="font-semibold text-xs">
                          {rule.lastExecuted ? new Date(rule.lastExecuted).toLocaleDateString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transfer Patterns */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Padrões de Transferência de Leads
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transferPatterns.map((pattern, index) => (
                  <div key={index} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          {pattern.fromStatus}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded">
                          {pattern.toStatus}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {pattern.count}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Automático: </span>
                        <span className="font-semibold text-teal-600">
                          {pattern.automationDriven}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Manual: </span>
                        <span className="font-semibold text-gray-600">
                          {pattern.manualChanges}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Atividades Recentes
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.automationName}</p>
                        <p className="text-sm text-gray-600">Lead: {activity.leadName}</p>
                        {activity.errorMessage && (
                          <p className="text-xs text-red-600 mt-1">{activity.errorMessage}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {activity.success ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        ) : (
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(activity.executedAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recomendações de Otimização
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      rec.type === 'info'? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {rec.type === 'warning' ? (
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      ) : rec.type === 'info' ? (
                        <ChartBarIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{rec.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium'? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {recommendations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-600" />
                    <p>Nenhuma recomendação no momento</p>
                    <p className="text-sm mt-1">Suas automações estão funcionando perfeitamente!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}