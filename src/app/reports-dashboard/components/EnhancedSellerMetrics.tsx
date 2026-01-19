'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { sellerReportsService, SellerReport } from '@/services/seller-reports.service';

interface EnhancedSellerMetricsProps {
  sellerId: string;
  startDate: string;
  endDate: string;
}

export default function EnhancedSellerMetrics({ sellerId, startDate, endDate }: EnhancedSellerMetricsProps) {
  const [metrics, setMetrics] = useState<SellerReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [sellerId, startDate, endDate]);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await sellerReportsService.getDetailedSellerReport(sellerId, startDate, endDate);
      setMetrics(data);
    } catch (error: any) {
      console.error('Error loading seller metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <Icon name="ArrowTrendingUpIcon" size={16} className="text-green-600" />;
    if (change < 0) return <Icon name="ArrowTrendingDownIcon" size={16} className="text-red-600" />;
    return <Icon name="MinusIcon" size={16} className="text-gray-600" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-3" />
            <div className="h-8 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Métricas Detalhadas do Vendedor
        </h3>
        <button 
          onClick={loadMetrics}
          className="text-sm text-primary hover:underline font-caption"
        >
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-smooth"
          >
            <div className="text-sm text-muted-foreground mb-2">
              {metric.metric_name}
            </div>
            <div className="text-2xl font-heading font-semibold text-foreground mb-2">
              {metric.metric_value.toLocaleString('pt-BR', {
                minimumFractionDigits: metric.metric_name.includes('R$') ? 2 : 0,
                maximumFractionDigits: metric.metric_name.includes('R$') ? 2 : 0
              })}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Período anterior: {metric.comparison_period.toLocaleString('pt-BR')}
              </span>
              <div className={`flex items-center gap-1 text-xs font-caption font-medium ${getChangeColor(metric.percentage_change)}`}>
                {getChangeIcon(metric.percentage_change)}
                {Math.abs(metric.percentage_change).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}