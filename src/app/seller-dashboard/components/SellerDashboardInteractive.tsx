'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { goalsService } from '@/services/goals.service';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';


import PerformanceCard from './PerformanceCard';
import ActivityFeedItem from './ActivityFeedItem';
import QuickActionButton from './QuickActionButton';
import SalesFunnelChart from './SalesFunnelChart';
import PerformanceTrendChart from './PerformanceTrendChart';
import PendingTaskCard from './PendingTaskCard';

interface PerformanceMetrics {
  assignedLeads: number;
  conversionRate: number;
  dailyTarget: number;
  weeklyTarget: number;
  revenue: number;
  trends: {
    leads: { value: number; isPositive: boolean };
    conversion: { value: number; isPositive: boolean };
    revenue: { value: number; isPositive: boolean };
  };
}

interface Activity {
  id: number;
  leadName: string;
  activity: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue';
}

interface FunnelStage {
  name: string;
  value: number;
  color: string;
}

interface TrendData {
  month: string;
  conversoes: number;
  meta: number;
}

interface PendingTask {
  id: number;
  title: string;
  dueDate: string;
  leadName: string;
  type: 'call' | 'meeting' | 'followup' | 'email';
}

interface Goal {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  period: string;
  status: string;
}

export default function SellerDashboardInteractive() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [sellerId, setSellerId] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
    if (userProfile?.id) {
      fetchSellerData();
    }
  }, [userProfile]);

  const fetchSellerData = async () => {
    if (!userProfile?.id) return;
    
    try {
      const supabase = createClient();
      const { data: sellerData, error } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', userProfile.id)
        .single();

      if (!error && sellerData) {
        setSellerId(sellerData.id);
        loadGoals(sellerData.id);
      }
    } catch (error: any) {
      console.error('Error fetching seller data:', error);
    }
  };

  const loadGoals = async (sellerIdParam: string) => {
    if (!userProfile?.company_id || !sellerIdParam) {
      setIsLoadingGoals(false);
      return;
    }

    try {
      setIsLoadingGoals(true);
      const goalsData = await goalsService.getSellerGoals(
        userProfile.company_id,
        sellerIdParam
      );
      setGoals(goalsData);
    } catch (error: any) {
      console.error('Error loading goals:', error);
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const performanceMetrics: PerformanceMetrics = {
    assignedLeads: 47,
    conversionRate: 32.5,
    dailyTarget: 5,
    weeklyTarget: 25,
    revenue: 18750.00,
    trends: {
      leads: { value: 12.5, isPositive: true },
      conversion: { value: 8.3, isPositive: true },
      revenue: { value: 15.7, isPositive: true },
    },
  };

  const recentActivities: Activity[] = [
    {
      id: 1,
      leadName: "Maria Silva",
      activity: "Aguardando retorno sobre proposta enviada",
      timestamp: "19/01/2026 às 16:30",
      priority: 'high',
      status: 'pending',
    },
    {
      id: 2,
      leadName: "João Santos",
      activity: "Follow-up agendado para amanhã",
      timestamp: "19/01/2026 às 14:15",
      priority: 'medium',
      status: 'pending',
    },
    {
      id: 3,
      leadName: "Ana Costa",
      activity: "Reunião realizada - enviar contrato",
      timestamp: "19/01/2026 às 11:00",
      priority: 'high',
      status: 'completed',
    },
    {
      id: 4,
      leadName: "Pedro Oliveira",
      activity: "SLA vencido - contato urgente necessário",
      timestamp: "18/01/2026 às 17:45",
      priority: 'high',
      status: 'overdue',
    },
    {
      id: 5,
      leadName: "Carla Mendes",
      activity: "Demonstração do produto agendada",
      timestamp: "19/01/2026 às 09:30",
      priority: 'medium',
      status: 'pending',
    },
  ];

  const funnelData: FunnelStage[] = [
    { name: 'Novos', value: 47, color: '#94a3b8' },
    { name: 'Contato', value: 35, color: '#64748b' },
    { name: 'Qualificado', value: 28, color: '#475569' },
    { name: 'Proposta', value: 18, color: '#1fc2a9' },
    { name: 'Negociação', value: 12, color: '#107c65' },
    { name: 'Fechado', value: 8, color: '#10b981' },
  ];

  const trendData: TrendData[] = [
    { month: 'Set', conversoes: 12, meta: 15 },
    { month: 'Out', conversoes: 15, meta: 15 },
    { month: 'Nov', conversoes: 18, meta: 20 },
    { month: 'Dez', conversoes: 22, meta: 20 },
    { month: 'Jan', conversoes: 16, meta: 25 },
  ];

  const pendingTasks: PendingTask[] = [
    {
      id: 1,
      title: "Ligar para Maria Silva",
      dueDate: "Hoje às 17:00",
      leadName: "Maria Silva",
      type: 'call',
    },
    {
      id: 2,
      title: "Reunião com João Santos",
      dueDate: "20/01/2026 às 10:00",
      leadName: "João Santos",
      type: 'meeting',
    },
    {
      id: 3,
      title: "Enviar proposta para Ana Costa",
      dueDate: "20/01/2026 às 14:00",
      leadName: "Ana Costa",
      type: 'email',
    },
  ];

  const [tasks, setTasks] = useState(pendingTasks);

  const handleTaskComplete = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'inbox': router.push('/inbox-system');
        break;
      case 'newLead': router.push('/lead-management?action=new');
        break;
      case 'whatsapp':
        // WhatsApp integration would be handled here
        break;
    }
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    // Export functionality would be implemented here
    setShowExportMenu(false);
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
            Meu Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe seu desempenho e gerencie seus leads
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-smooth focus-ring"
          >
            <Icon name="ArrowDownTrayIcon" size={20} className="text-foreground" />
            <span className="text-sm font-medium font-caption text-foreground">Exportar</span>
          </button>
          {showExportMenu && (
            <>
              <div
                className="fixed inset-0 z-dropdown"
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-warm-lg z-dropdown">
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-smooth"
                >
                  <Icon name="DocumentIcon" size={20} className="text-success" />
                  <span className="text-sm font-caption text-foreground">Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-smooth border-t border-border"
                >
                  <Icon name="DocumentTextIcon" size={20} className="text-error" />
                  <span className="text-sm font-caption text-foreground">PDF (.pdf)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PerformanceCard
          title="Leads Atribuídos"
          value={performanceMetrics.assignedLeads}
          icon="M15 19l-7-7 7-7"
          trend={performanceMetrics.trends.leads}
          variant="default"
        />
        <PerformanceCard
          title="Taxa de Conversão"
          value={`${performanceMetrics.conversionRate}%`}
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          trend={performanceMetrics.trends.conversion}
          variant="primary"
        />
        <PerformanceCard
          title="Meta Semanal"
          value={`${performanceMetrics.dailyTarget}/${performanceMetrics.weeklyTarget}`}
          subtitle="conversões"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          variant="warning"
        />
        <PerformanceCard
          title="Receita Gerada"
          value={`R$ ${performanceMetrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          trend={performanceMetrics.trends.revenue}
          variant="success"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionButton
          label="Inbox"
          icon="InboxIcon"
          count={12}
          onClick={() => handleQuickAction('inbox')}
        />
        <QuickActionButton
          label="Novo Lead"
          icon="PlusCircleIcon"
          variant="primary"
          onClick={() => handleQuickAction('newLead')}
        />
        <QuickActionButton
          label="WhatsApp"
          icon="ChatBubbleLeftRightIcon"
          count={5}
          onClick={() => handleQuickAction('whatsapp')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activities */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold text-foreground">
                Atividades Recentes
              </h2>
              <button className="text-sm font-caption text-primary hover:text-primary/80 transition-smooth">
                Ver todas
              </button>
            </div>
            <div className="space-y-2">
              {recentActivities.map((activity) => (
                <ActivityFeedItem key={activity.id} {...activity} />
              ))}
            </div>
          </div>

          {/* Sales Funnel Chart */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
              Funil de Vendas
            </h2>
            <SalesFunnelChart data={funnelData} />
          </div>

          {/* Performance Trend Chart */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
              Tendência de Performance
            </h2>
            <PerformanceTrendChart data={trendData} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-foreground">
                Tarefas Pendentes
              </h2>
              <span className="text-xs px-2 py-1 bg-warning/10 text-warning rounded border border-warning/20 font-caption">
                {tasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <PendingTaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => handleTaskComplete(task.id)}
                />
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-heading font-semibold text-foreground mb-4">
              Estatísticas Rápidas
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Leads Novos Hoje</span>
                <span className="text-lg font-semibold text-foreground">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Conversões Esta Semana</span>
                <span className="text-lg font-semibold text-success">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mensagens Não Lidas</span>
                <span className="text-lg font-semibold text-warning">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Follow-ups Agendados</span>
                <span className="text-lg font-semibold text-primary">7</span>
              </div>
            </div>
          </div>

          {/* SLA Alerts */}
          <div className="bg-error/10 border border-error/20 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <Icon name="ExclamationTriangleIcon" size={24} className="text-error flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-error mb-1">Alertas de SLA</h3>
                <p className="text-xs text-error/80">3 leads com SLA vencido</p>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-smooth text-sm font-medium font-caption">
              Ver Leads Críticos
            </button>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-card rounded-lg shadow-md border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Minhas Metas
          </h2>
          <button className="text-sm text-primary hover:underline">
            Ver todas
          </button>
        </div>
        
        {isLoadingGoals ? (
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="ChartBarIcon" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma meta cadastrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.slice(0, 3).map((goal) => {
              const progress = (goal.current_value / goal.target_value) * 100;
              return (
                <div key={goal.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-caption font-medium text-foreground">
                      {goal.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {goal.period}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-smooth"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-caption text-foreground whitespace-nowrap">
                      R$ {goal.current_value.toLocaleString('pt-BR')} / R$ {goal.target_value.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}