'use client';

import Icon from '@/components/ui/AppIcon';

interface PendingApproval {
  id: number;
  type: 'discount' | 'lead_transfer' | 'custom_stage';
  requestedBy: string;
  details: string;
  timestamp: string;
}

interface PendingApprovalsListProps {
  approvals: PendingApproval[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export default function PendingApprovalsList({ approvals, onApprove, onReject }: PendingApprovalsListProps) {
  const getTypeIcon = (type: PendingApproval['type']) => {
    switch (type) {
      case 'discount':
        return 'ReceiptPercentIcon';
      case 'lead_transfer':
        return 'ArrowsRightLeftIcon';
      case 'custom_stage':
        return 'AdjustmentsHorizontalIcon';
      default:
        return 'DocumentTextIcon';
    }
  };

  const getTypeLabel = (type: PendingApproval['type']) => {
    switch (type) {
      case 'discount':
        return 'Desconto';
      case 'lead_transfer':
        return 'Transferência de Lead';
      case 'custom_stage':
        return 'Etapa Personalizada';
      default:
        return 'Aprovação';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground">Aprovações Pendentes</h3>
        <span className="px-3 py-1 bg-warning/10 text-warning text-xs font-caption font-medium rounded-full">
          {approvals.length} pendentes
        </span>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-custom">
        {approvals.map((approval) => (
          <div key={approval.id} className="p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Icon name={getTypeIcon(approval.type) as any} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-caption font-medium text-primary">
                    {getTypeLabel(approval.type)}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{approval.timestamp}</span>
                </div>
                <p className="text-sm text-foreground mb-1">{approval.details}</p>
                <p className="text-xs text-muted-foreground">Solicitado por: {approval.requestedBy}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApprove(approval.id)}
                className="flex-1 h-9 px-4 bg-success text-success-foreground rounded-lg text-sm font-caption font-medium hover:opacity-90 transition-smooth focus-ring"
              >
                Aprovar
              </button>
              <button
                onClick={() => onReject(approval.id)}
                className="flex-1 h-9 px-4 bg-error text-error-foreground rounded-lg text-sm font-caption font-medium hover:opacity-90 transition-smooth focus-ring"
              >
                Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}