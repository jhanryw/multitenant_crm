'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FunnelData {
  stage: string;
  count: number;
  color: string;
}

interface SalesFunnelChartProps {
  data: FunnelData[];
}

export default function SalesFunnelChart({ data }: SalesFunnelChartProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm-sm">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-6">Funil de Vendas</h3>
      <div className="w-full h-80" aria-label="Gráfico de Funil de Vendas">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis 
              type="category" 
              dataKey="stage" 
              stroke="#64748b" 
              style={{ fontSize: '12px' }}
              width={120}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}