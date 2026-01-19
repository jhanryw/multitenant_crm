'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendData {
  month: string;
  leads: number;
  conversions: number;
  revenue: number;
}

interface MonthlyTrendChartProps {
  data: TrendData[];
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm-sm">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-6">Tendência Mensal</h3>
      <div className="w-full h-80" aria-label="Gráfico de Tendência Mensal">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis 
              dataKey="month" 
              stroke="#64748b" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="leads" 
              stroke="#1fc2a9" 
              strokeWidth={2}
              name="Leads"
              dot={{ fill: '#1fc2a9', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="conversions" 
              stroke="#107c65" 
              strokeWidth={2}
              name="Conversões"
              dot={{ fill: '#107c65', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}