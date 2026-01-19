'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendData {
  month: string;
  conversoes: number;
  meta: number;
}

interface PerformanceTrendChartProps {
  data: TrendData[];
}

export default function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
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
    <div className="w-full h-80" aria-label="Gráfico de Tendência de Performance">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis
            dataKey="month"
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
          />
          <Legend
            wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="conversoes"
            stroke="#1fc2a9"
            strokeWidth={3}
            dot={{ fill: '#1fc2a9', r: 4 }}
            activeDot={{ r: 6 }}
            name="Conversões"
          />
          <Line
            type="monotone"
            dataKey="meta"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#f59e0b', r: 4 }}
            name="Meta"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}