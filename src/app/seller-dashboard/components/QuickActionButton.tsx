import Icon from '@/components/ui/AppIcon';

interface QuickActionButtonProps {
  label: string;
  icon: string;
  count?: number;
  variant?: 'default' | 'primary';
  onClick: () => void;
}

export default function QuickActionButton({
  label,
  icon,
  count,
  variant = 'default',
  onClick,
}: QuickActionButtonProps) {
  const getVariantStyles = () => {
    if (variant === 'primary') {
      return 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm-sm';
    }
    return 'bg-card text-foreground hover:bg-muted border border-border';
  };

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-3 px-6 py-4 rounded-lg transition-smooth focus-ring ${getVariantStyles()}`}
    >
      <Icon name={icon as any} size={24} />
      <span className="text-sm font-medium font-caption">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-error text-error-foreground text-xs font-caption font-medium rounded-full flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}