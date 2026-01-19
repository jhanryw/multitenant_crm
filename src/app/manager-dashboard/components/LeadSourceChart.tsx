'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SourceData {
  name: string;
  value: number;
  color: string;
}

interface LeadSourceChartProps {
  data: SourceData[];
}

export default function LeadSourceChart({ data }: LeadSourceChartProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm-sm">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-6">Origem dos Leads</h3>
      <div className="w-full h-80" aria-label="Gráfico de Origem dos Leads">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}