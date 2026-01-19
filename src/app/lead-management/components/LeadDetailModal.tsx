'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Tag {
  id: number;
  name: string;
  color: string;
  type: 'automatic' | 'manual';
}

interface Activity {
  id: number;
  type: 'message' | 'status_change' | 'note' | 'call' | 'email';
  description: string;
  timestamp: string;
  user: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  avatarAlt: string;
  source: string;
  assignedSeller: string;
  tags: Tag[];
  priority: 'high' | 'medium' | 'low';
  slaStatus: 'ok' | 'warning' | 'critical';
  slaTimeRemaining: string;
  lastActivity: string;
  value: number;
  sector: string;
  createdAt: string;
  activities: Activity[];
  notes: string;
}

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export default function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'info'>('activity');

  useState(() => {
    setIsHydrated(true);
  });

  if (!lead || !isHydrated) {
    return null;
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return 'ChatBubbleLeftIcon';
      case 'status_change':
        return 'ArrowPathIcon';
      case 'note':
        return 'DocumentTextIcon';
      case 'call':
        return 'PhoneIcon';
      case 'email':
        return 'EnvelopeIcon';
      default:
        return 'ClockIcon';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'text-primary';
      case 'status_change':
        return 'text-warning';
      case 'note':
        return 'text-accent';
      case 'call':
        return 'text-success';
      case 'email':
        return 'text-secondary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-modal flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-card border border-border rounded-lg shadow-warm-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <AppImage
                src={lead.avatar}
                alt={lead.avatarAlt}
                width={56}
                height={56}
                className="rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground mb-1">
                  {lead.name}
                </h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="PhoneIcon" size={14} />
                    {lead.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="EnvelopeIcon" size={14} />
                    {lead.email}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-smooth focus-ring"
              aria-label="Fechar modal"
            >
              <Icon name="XMarkIcon" size={24} className="text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border px-6">
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-3 text-sm font-caption font-medium border-b-2 transition-smooth ${
                activeTab === 'activity' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Histórico de Atividades
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 text-sm font-caption font-medium border-b-2 transition-smooth ${
                activeTab === 'info' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Informações
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)] scrollbar-custom">
            {activeTab === 'activity' ? (
              <div className="space-y-4">
                {lead.activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        <Icon name={getActivityIcon(activity.type) as any} size={16} />
                      </div>
                      {index < lead.activities.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="text-sm text-foreground mb-1">{activity.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-sm font-heading font-semibold text-foreground mb-4">
                    Informações Básicas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-caption text-muted-foreground mb-1">
                        Origem
                      </label>
                      <p className="text-sm text-foreground">{lead.source}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-caption text-muted-foreground mb-1">
                        Setor
                      </label>
                      <p className="text-sm text-foreground">{lead.sector}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-caption text-muted-foreground mb-1">
                        Vendedor Responsável
                      </label>
                      <p className="text-sm text-foreground">{lead.assignedSeller}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-caption text-muted-foreground mb-1">
                        Data de Criação
                      </label>
                      <p className="text-sm text-foreground">{lead.createdAt}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-caption text-muted-foreground mb-1">
                        Valor Estimado
                      </label>
                      <p className="text-sm font-heading font-semibold text-foreground">
                        R$ {lead.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-caption text-muted-foreground mb-1">
                        Status SLA
                      </label>
                      <p className="text-sm text-foreground">{lead.slaTimeRemaining}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-sm font-heading font-semibold text-foreground mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs font-caption px-3 py-1.5 rounded"
                        style={{
                          backgroundColor: tag.color,
                          color: '#ffffff',
                        }}
                      >
                        {tag.name}
                        <span className="ml-2 opacity-70">
                          ({tag.type === 'automatic' ? 'Auto' : 'Manual'})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-sm font-heading font-semibold text-foreground mb-3">
                    Observações
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {lead.notes || 'Nenhuma observação registrada.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <button className="flex items-center gap-2 px-4 h-10 rounded-lg bg-muted text-foreground hover:bg-muted/80 font-caption font-medium transition-smooth focus-ring">
              <Icon name="ChatBubbleLeftIcon" size={18} />
              <span>Enviar Mensagem</span>
            </button>
            <button className="flex items-center gap-2 px-4 h-10 rounded-lg bg-muted text-foreground hover:bg-muted/80 font-caption font-medium transition-smooth focus-ring">
              <Icon name="PencilIcon" size={18} />
              <span>Editar</span>
            </button>
            <button className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-caption font-medium transition-smooth focus-ring">
              <Icon name="CheckIcon" size={18} />
              <span>Atualizar Status</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}