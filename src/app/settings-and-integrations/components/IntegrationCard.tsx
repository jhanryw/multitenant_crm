import Icon from '@/components/ui/AppIcon';

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'pending';
  lastSync?: string;
  onConfigure: () => void;
  onTest?: () => void;
}

export default function IntegrationCard({
  title,
  description,
  icon,
  status,
  lastSync,
  onConfigure,
  onTest,
}: IntegrationCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-success/10 text-success border-success/20';
      case 'disconnected':
        return 'bg-error/10 text-error border-error/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'pending':
        return 'Pendente';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-warm-md transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={icon as any} size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-caption font-medium border ${getStatusColor()}`}
        >
          {getStatusLabel()}
        </span>
      </div>

      {lastSync && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Icon name="ClockIcon" size={16} />
          <span>Última sincronização: {lastSync}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={onConfigure}
          className="flex-1 h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-caption font-medium hover:opacity-90 transition-smooth focus-ring"
        >
          Configurar
        </button>
        {onTest && (
          <button
            onClick={onTest}
            className="h-10 px-4 bg-muted text-foreground rounded-lg text-sm font-caption font-medium hover:bg-muted/80 transition-smooth focus-ring"
          >
            Testar
          </button>
        )}
      </div>
    </div>
  );
}