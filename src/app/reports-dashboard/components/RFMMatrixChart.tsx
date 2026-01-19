'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { rfmService, RFMAnalysis } from '@/services/rfm.service';

export default function RFMMatrixChart() {
  const [rfmData, setRfmData] = useState<RFMAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRFMData();
  }, []);

  const loadRFMData = async () => {
    try {
      setIsLoading(true);
      const companyId = 'demo-company-id'; // Replace with actual company ID
      await rfmService.calculateRFMScores(companyId);
      const data = await rfmService.getRFMAnalysisBySegment(companyId);
      setRfmData(data);
    } catch (error: any) {
      console.error('Error loading RFM data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSegmentColor = (segment: string) => {
    const colors: Record<string, string> = {
      champions: '#10b981',
      loyal_customers: '#3b82f6',
      potential_loyalist: '#8b5cf6',
      new_customers: '#06b6d4',
      promising: '#14b8a6',
      need_attention: '#f59e0b',
      about_to_sleep: '#f97316',
      at_risk: '#ef4444',
      cant_lose: '#dc2626',
      hibernating: '#6b7280',
      lost: '#374151'
    };
    return colors[segment] || '#94a3b8';
  };

  const getSegmentLabel = (segment: string) => {
    const labels: Record<string, string> = {
      champions: 'Campeões',
      loyal_customers: 'Clientes Leais',
      potential_loyalist: 'Potenciais Leais',
      new_customers: 'Novos Clientes',
      promising: 'Promissores',
      need_attention: 'Precisam Atenção',
      about_to_sleep: 'Prestes a Dormir',
      at_risk: 'Em Risco',
      cant_lose: 'Não Pode Perder',
      hibernating: 'Hibernando',
      lost: 'Perdidos'
    };
    return labels[segment] || segment;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4" />
          <div className="h-80 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const chartData = rfmData.map(item => ({
    segment: getSegmentLabel(item.segment),
    count: item.count,
    value: item.total_value,
    color: getSegmentColor(item.segment)
  }));

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
          Matriz RFM - Segmentação de Leads
        </h3>
        <p className="text-sm text-muted-foreground">
          Análise de Recência, Frequência e Valor Monetário
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="segment" 
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: any) => {
              if (typeof value === 'number') {
                return value.toLocaleString('pt-BR');
              }
              return value;
            }}
          />
          <Legend />
          <Bar dataKey="count" name="Quantidade de Leads" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Segment Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {rfmData.slice(0, 4).map((item) => (
          <div
            key={item.segment}
            className="border border-border rounded-lg p-3"
            style={{ borderLeftWidth: '4px', borderLeftColor: getSegmentColor(item.segment) }}
          >
            <div className="text-xs text-muted-foreground mb-1">
              {getSegmentLabel(item.segment)}
            </div>
            <div className="text-lg font-heading font-semibold text-foreground">
              {item.count}
            </div>
            <div className="text-xs text-muted-foreground">
              R$ {item.total_value.toLocaleString('pt-BR')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}