'use client';

import Icon from '@/components/ui/AppIcon';

interface SLAAlert {
  id: number;
  leadName: string;
  assignedTo: string;
  timeRemaining: string;
  priority: 'high' | 'medium' | 'low';
  status: 'overdue' | 'warning' | 'normal';
}

interface SLAAlertListProps {
  alerts: SLAAlert[];
}

export default function SLAAlertList({ alerts }: SLAAlertListProps) {
  const getStatusColor = (status: SLAAlert['status']) => {
    switch (status) {
      case 'overdue':
        return 'bg-error/10 text-error border-error/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'normal':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityIcon = (priority: SLAAlert['priority']) => {
    switch (priority) {
      case 'high':
        return 'ExclamationTriangleIcon';
      case 'medium':
        return 'ExclamationCircleIcon';
      case 'low':
        return 'InformationCircleIcon';
      default:
        return 'BellIcon';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground">Alertas de SLA</h3>
        <span className="text-sm font-caption text-muted-foreground">
          {alerts.filter(a => a.status === 'overdue').length} atrasados
        </span>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-custom">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-4 rounded-lg border transition-smooth ${getStatusColor(alert.status)}`}
          >
            <div className="flex items-start gap-3">
              <Icon 
                name={getPriorityIcon(alert.priority) as any} 
                size={20} 
                className="flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">{alert.leadName}</p>
                <p className="text-xs mb-2">Atribuído a: {alert.assignedTo}</p>
                <div className="flex items-center gap-2">
                  <Icon name="ClockIcon" size={14} />
                  <span className="text-xs font-medium">{alert.timeRemaining}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}