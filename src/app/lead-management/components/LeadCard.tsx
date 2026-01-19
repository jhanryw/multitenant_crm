'use client';

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Tag {
  id: number;
  name: string;
  color: string;
  type: 'automatic' | 'manual';
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
}

interface LeadCardProps {
  lead: Lead;
  onCardClick: (lead: Lead) => void;
  stageId: number;
}

const LeadCard = memo(function LeadCard({ lead, onCardClick, stageId }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: {
      stageId: stageId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    opacity: isDragging ? 0.3 : 1,
    willChange: 'transform',
  };

  const getSLAColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-border';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card border-2 ${getPriorityColor(lead.priority)} rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-xl transition-all duration-200 ease-out ${
        isDragging ? 'shadow-2xl scale-105 rotate-2' : 'hover:scale-[1.02]'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative">
          <Image
            src={lead.avatar}
            alt={lead.avatarAlt}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <div
            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
              lead.slaStatus === 'ok' ?'bg-success'
                : lead.slaStatus === 'warning' ?'bg-warning' :'bg-error'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-heading font-semibold text-foreground truncate mb-1">
            {lead.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="PhoneIcon" size={12} />
            <span className="truncate">{lead.phone}</span>
          </div>
        </div>
        <span className={`text-xs font-caption px-2 py-1 rounded ${getPriorityColor(lead.priority)}`}>
          {lead.priority}
        </span>
      </div>

      {/* Tags */}
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {lead.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs font-caption px-2 py-1 rounded"
              style={{
                backgroundColor: tag.color,
                color: '#ffffff',
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="TagIcon" size={14} />
          <span>Origem: {lead.source}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="UserIcon" size={14} />
          <span>Vendedor: {lead.assignedSeller}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Icon name="ClockIcon" size={14} className={getSLAColor(lead.slaStatus)} />
          <span className={getSLAColor(lead.slaStatus)}>SLA: {lead.slaTimeRemaining}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm font-heading font-semibold text-foreground">
          R$ {lead.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
        <span className="text-xs text-muted-foreground">{lead.lastActivity}</span>
      </div>

      {/* Drag Indicator */}
      <div className="absolute top-2 right-2 text-muted-foreground transition-transform duration-200 hover:scale-110">
        <Icon name="Bars3Icon" size={16} />
      </div>
      
      {/* Click handler overlay */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onCardClick(lead);
        }}
      />
    </div>
  );
});

export default LeadCard;