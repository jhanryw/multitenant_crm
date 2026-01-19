interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: string;
  trend: 'up' | 'down';
}

export default function MetricCard({ title, value, change, icon, trend }: MetricCardProps) {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm-sm hover:shadow-warm-md transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-caption text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-heading font-semibold text-foreground">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          isPositive ? 'bg-success/10' : 'bg-error/10'
        }`}>
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
            <path
              d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
              fill={isPositive ? '#10b981' : '#ef4444'}
              fillOpacity="0.2"
            />
            <path
              d="M12 8V16M8 12H16"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${
          isPositive ? 'text-success' : 'text-error'
        }`}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}%
        </span>
        <span className="text-sm text-muted-foreground">vs. mês anterior</span>
      </div>
    </div>
  );
}