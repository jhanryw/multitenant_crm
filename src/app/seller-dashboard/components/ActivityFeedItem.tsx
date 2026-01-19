import Icon from '@/components/ui/AppIcon';

interface ActivityFeedItemProps {
  id: number;
  leadName: string;
  activity: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue';
}

export default function ActivityFeedItem({
  leadName,
  activity,
  timestamp,
  priority,
  status,
}: ActivityFeedItemProps) {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return 'bg-error/10 text-error border-error/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return 'CheckCircleIcon';
      case 'overdue':
        return 'ExclamationCircleIcon';
      default:
        return 'ClockIcon';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'overdue':
        return 'text-error';
      default:
        return 'text-warning';
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-smooth border border-transparent hover:border-border">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor()}`}>
        <Icon name={getStatusIcon() as any} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm font-medium text-foreground truncate">{leadName}</h4>
          <span className={`text-xs px-2 py-1 rounded border font-caption flex-shrink-0 ${getPriorityColor()}`}>
            {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Média' : 'Baixa'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{activity}</p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </div>
  );
}