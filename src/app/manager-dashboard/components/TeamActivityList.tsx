'use client';

import Icon from '@/components/ui/AppIcon';

interface Activity {
  id: number;
  userName: string;
  action: string;
  leadName: string;
  timestamp: string;
  type: 'lead_created' | 'lead_converted' | 'message_sent' | 'lead_assigned';
}

interface TeamActivityListProps {
  activities: Activity[];
}

export default function TeamActivityList({ activities }: TeamActivityListProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'lead_created':
        return 'PlusCircleIcon';
      case 'lead_converted':
        return 'CheckCircleIcon';
      case 'message_sent':
        return 'ChatBubbleLeftIcon';
      case 'lead_assigned':
        return 'UserPlusIcon';
      default:
        return 'BellIcon';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'lead_created':
        return 'text-primary';
      case 'lead_converted':
        return 'text-success';
      case 'message_sent':
        return 'text-accent';
      case 'lead_assigned':
        return 'text-secondary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground">Atividades da Equipe</h3>
        <button className="text-sm font-caption text-primary hover:text-primary/80 transition-smooth">
          Ver todas
        </button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-custom">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-b-0 last:pb-0">
            <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
              <Icon name={getActivityIcon(activity.type) as any} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground mb-1">
                <span className="font-medium">{activity.userName}</span> {activity.action}{' '}
                <span className="font-medium">{activity.leadName}</span>
              </p>
              <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}