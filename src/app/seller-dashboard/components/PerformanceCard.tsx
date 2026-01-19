interface PerformanceCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export default function PerformanceCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}: PerformanceCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/10 border-primary/20';
      case 'success':
        return 'bg-success/10 border-success/20';
      case 'warning':
        return 'bg-warning/10 border-warning/20';
      default:
        return 'bg-card border-border';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return 'text-primary';
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={`rounded-lg border p-6 transition-smooth hover:shadow-warm-md ${getVariantStyles()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-caption text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-heading font-semibold text-foreground">{value}</h3>
          {subtitle && (
            <p className="text-xs font-caption text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center ${getIconColor()}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-success' : 'text-error'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-muted-foreground">vs. semana anterior</span>
        </div>
      )}
    </div>
  );
}