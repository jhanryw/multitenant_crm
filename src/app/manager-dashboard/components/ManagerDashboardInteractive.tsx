'use client';

import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, RechartsTooltip, Legend, Bar, FunnelChart, Funnel, Cell } from 'recharts';
import { ArrowTrendingUpIcon, ClipboardDocumentCheckIcon, ChartBarIcon, FunnelIcon, CheckIcon, TrophyIcon, PlusIcon, ChatBubbleLeftRightIcon } from 'lucide-react';

const ManagerDashboardInteractive: React.FC = () => {
  const [selectedDateRange, setSelectedDateRange] = useState<string>('7d');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([
    {
      id: 1,
      type: 'lead',
      message: 'João Silva converteu lead de "Proposta" para "Fechado Ganho"',
      timestamp: 'há 2 horas',
      icon: ArrowTrendingUpIcon
    },
    {
      id: 2,
      type: 'approval',
      message: 'Aprovação de desconto pendente para negócio de €15.000 (Maria Santos)',
      timestamp: 'há 3 horas',
      icon: ClipboardDocumentCheckIcon
    },
    {
      id: 3,
      type: 'task',
      message: 'Lucas Oliveira completou acompanhamento de 5 leads qualificados',
      timestamp: 'há 5 horas',
      icon: CheckIcon
    },
    {
      id: 4,
      type: 'milestone',
      message: 'Equipe alcançou 85% da meta mensal com 1 semana restante',
      timestamp: 'há 1 dia',
      icon: TrophyIcon
    }
  ]);

  const dateRangeOptions = [
    { value: '7d', label: 'Últimos 7 Dias' },
    { value: '30d', label: 'Últimos 30 Dias' },
    { value: '90d', label: 'Últimos 90 Dias' },
    { value: 'custom', label: 'Período Personalizado' }
  ];

  // Mock data for charts based on date range
  const getChartData = () => {
    switch (selectedDateRange) {
      case '7d':
        return {
          performance: [
            { name: 'Seg', team: 12, target: 15 },
            { name: 'Ter', team: 18, target: 15 },
            { name: 'Qua', team: 14, target: 15 },
            { name: 'Qui', team: 22, target: 15 },
            { name: 'Sex', team: 19, target: 15 },
            { name: 'Sáb', team: 8, target: 15 },
            { name: 'Dom', team: 11, target: 15 }
          ],
          funnel: [
            { name: 'Novos Leads', value: 234, fill: '#1fc2a9' },
            { name: 'Qualificados', value: 156, fill: '#107c65' },
            { name: 'Proposta', value: 89, fill: '#f59e0b' },
            { name: 'Negociação', value: 42, fill: '#10b981' },
            { name: 'Fechado Ganho', value: 28, fill: '#1fc2a9' }
          ],
          leadSources: [
            { name: 'Site', value: 89, percentage: 38 },
            { name: 'Indicação', value: 67, percentage: 29 },
            { name: 'Redes Sociais', value: 45, percentage: 19 },
            { name: 'E-mail', value: 33, percentage: 14 }
          ]
        };
      case '30d':
        return {
          performance: [
            { name: 'Semana 1', team: 78, target: 60 },
            { name: 'Semana 2', team: 92, target: 60 },
            { name: 'Semana 3', team: 81, target: 60 },
            { name: 'Semana 4', team: 95, target: 60 }
          ],
          funnel: [
            { name: 'Novos Leads', value: 987, fill: '#1fc2a9' },
            { name: 'Qualificados', value: 654, fill: '#107c65' },
            { name: 'Proposta', value: 389, fill: '#f59e0b' },
            { name: 'Negociação', value: 198, fill: '#10b981' },
            { name: 'Fechado Ganho', value: 134, fill: '#1fc2a9' }
          ],
          leadSources: [
            { name: 'Site', value: 378, percentage: 38 },
            { name: 'Indicação', value: 289, percentage: 29 },
            { name: 'Redes Sociais', value: 198, percentage: 20 },
            { name: 'E-mail', value: 122, percentage: 13 }
          ]
        };
      default:
        return {
          performance: [
            { name: 'Seg', team: 12, target: 15 },
            { name: 'Ter', team: 18, target: 15 },
            { name: 'Qua', team: 14, target: 15 },
            { name: 'Qui', team: 22, target: 15 },
            { name: 'Sex', team: 19, target: 15 },
            { name: 'Sáb', team: 8, target: 15 },
            { name: 'Dom', team: 11, target: 15 }
          ],
          funnel: [
            { name: 'Novos Leads', value: 234, fill: '#1fc2a9' },
            { name: 'Qualificados', value: 156, fill: '#107c65' },
            { name: 'Proposta', value: 89, fill: '#f59e0b' },
            { name: 'Negociação', value: 42, fill: '#10b981' },
            { name: 'Fechado Ganho', value: 28, fill: '#1fc2a9' }
          ],
          leadSources: [
            { name: 'Site', value: 89, percentage: 38 },
            { name: 'Indicação', value: 67, percentage: 29 },
            { name: 'Redes Sociais', value: 45, percentage: 19 },
            { name: 'E-mail', value: 33, percentage: 14 }
          ]
        };
    }
  };

  const chartData = getChartData();

  const currentMetrics = {
    totalRevenue: { value: 'R$ 187.450,00', change: 18.7, trend: 'up' as const },
    conversionRate: { value: '23,4%', change: 5.2, trend: 'up' as const },
    avgDealSize: { value: 'R$ 3.250,00', change: -2.3, trend: 'down' as const },
    teamPerformance: { value: '85%', change: 10, trend: 'up' as const },
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral', change: number) => {
    if (trend === 'up') {
      return 'text-green-500';
    } else if (trend === 'down') {
      return 'text-red-500';
    } else {
      return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down') {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />;
    } else {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-h2 font-heading font-semibold text-text-primary">Dashboard do Gerente</h1>
          <p className="text-sm text-text-secondary mt-1">Visão abrangente de desempenho da equipe e pipeline</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-warm-md transition-smooth">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-primary" />
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor('up', currentMetrics.totalRevenue.change)}`}>
              {getTrendIcon(currentMetrics.totalRevenue.trend)}
              <span className="text-sm font-medium">{Math.abs(currentMetrics.totalRevenue.change)}%</span>
            </div>
          </div>
          <h3 className="text-h4 font-heading font-semibold text-text-primary">{currentMetrics.totalRevenue.value}</h3>
          <p className="text-sm text-text-secondary mt-1">Receita Total</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-warm-md transition-smooth">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-success/10 rounded-lg">
              <FunnelIcon className="w-5 h-5 text-success" />
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor(currentMetrics.conversionRate.trend, currentMetrics.conversionRate.change)}`}>
              {getTrendIcon(currentMetrics.conversionRate.trend)}
              <span className="text-sm font-medium">{Math.abs(currentMetrics.conversionRate.change)}%</span>
            </div>
          </div>
          <h3 className="text-h4 font-heading font-semibold text-text-primary">{currentMetrics.conversionRate.value}</h3>
          <p className="text-sm text-text-secondary mt-1">Taxa de Conversão</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-warm-md transition-smooth">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-accent/10 rounded-lg">
              <ArrowTrendingUpIcon className="w-5 h-5 text-accent" />
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor(currentMetrics.avgDealSize.trend, currentMetrics.avgDealSize.change)}`}>
              {getTrendIcon(currentMetrics.avgDealSize.trend)}
              <span className="text-sm font-medium">{Math.abs(currentMetrics.avgDealSize.change)}%</span>
            </div>
          </div>
          <h3 className="text-h4 font-heading font-semibold text-text-primary">{currentMetrics.avgDealSize.value}</h3>
          <p className="text-sm text-text-secondary mt-1">Ticket Médio</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-warm-md transition-smooth">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <TrophyIcon className="w-5 h-5 text-secondary" />
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor('up', currentMetrics.teamPerformance.change)}`}>
              {getTrendIcon(currentMetrics.teamPerformance.trend)}
              <span className="text-sm font-medium">{currentMetrics.teamPerformance.change}%</span>
            </div>
          </div>
          <h3 className="text-h4 font-heading font-semibold text-text-primary">{currentMetrics.teamPerformance.value}</h3>
          <p className="text-sm text-text-secondary mt-1">Desempenho da Equipe</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-h4 font-heading font-semibold text-text-primary mb-4">Desempenho da Equipe vs Meta</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-text-secondary)" />
              <YAxis stroke="var(--color-text-secondary)" />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="team" fill="#1fc2a9" name="Desempenho da Equipe" />
              <Bar dataKey="target" fill="#f59e0b" name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Funnel */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-h4 font-heading font-semibold text-text-primary mb-4">Funil de Vendas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Funnel dataKey="value" data={chartData.funnel} isAnimationActive>
                {chartData.funnel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lead Sources and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-h4 font-heading font-semibold text-text-primary mb-4">Fontes de Leads</h3>
          <div className="space-y-4">
            {chartData.leadSources.map((source, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-text-primary">{source.name}</span>
                  <span className="text-sm text-text-secondary">{source.value} leads ({source.percentage}%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-smooth"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-h4 font-heading font-semibold text-text-primary mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-3 p-3 bg-surface rounded-lg hover:bg-muted transition-smooth">
                <div className="p-2 bg-primary/10 rounded-lg h-fit">
                  <activity.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{activity.message}</p>
                  <p className="text-xs text-text-secondary mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-h4 font-heading font-semibold text-text-primary mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button className="flex items-center gap-3 p-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-smooth">
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Novo Lead</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-smooth">
            <ClipboardDocumentCheckIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Revisar Aprovações</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-smooth">
            <ChartBarIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Ver Relatórios</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg transition-smooth">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Chat da Equipe</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardInteractive;