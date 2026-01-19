import Icon from '@/components/ui/AppIcon';

interface PendingTask {
  id: number;
  title: string;
  dueDate: string;
  leadName: string;
  type: 'call' | 'meeting' | 'followup' | 'email';
}

interface PendingTaskCardProps {
  task: PendingTask;
  onComplete: () => void;
}

export default function PendingTaskCard({ task, onComplete }: PendingTaskCardProps) {
  const getTaskIcon = () => {
    switch (task.type) {
      case 'call':
        return 'PhoneIcon';
      case 'meeting':
        return 'CalendarIcon';
      case 'email':
        return 'EnvelopeIcon';
      default:
        return 'BellAlertIcon';
    }
  };

  const getTaskColor = () => {
    switch (task.type) {
      case 'call':
        return 'bg-primary/10 text-primary';
      case 'meeting':
        return 'bg-warning/10 text-warning';
      case 'email':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-warm-sm transition-smooth">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTaskColor()}`}>
        <Icon name={getTaskIcon() as any} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground mb-1">{task.title}</h4>
        <p className="text-sm text-muted-foreground mb-1">{task.leadName}</p>
        <div className="flex items-center gap-2">
          <Icon name="ClockIcon" size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{task.dueDate}</span>
        </div>
      </div>
      <button
        onClick={onComplete}
        className="p-2 rounded-lg hover:bg-success/10 text-success transition-smooth focus-ring"
        aria-label="Marcar como concluída"
      >
        <Icon name="CheckIcon" size={20} />
      </button>
    </div>
  );
}