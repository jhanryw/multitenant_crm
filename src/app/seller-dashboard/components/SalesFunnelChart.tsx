'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FunnelStage {
  name: string;
  value: number;
  color: string;
}

interface SalesFunnelChartProps {
  data: FunnelStage[];
}

export default function SalesFunnelChart({ data }: SalesFunnelChartProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="w-full h-80 bg-muted/30 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando gráfico...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80" aria-label="Gráfico de Funil de Vendas">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '8px',
              fontSize: '14px',
            }}
            labelStyle={{ color: '#1f2937', fontWeight: 600 }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}