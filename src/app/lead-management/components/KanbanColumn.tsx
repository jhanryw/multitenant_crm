'use client';

import { useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Icon from '@/components/ui/AppIcon';
import LeadCard from './LeadCard';

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

interface KanbanStage {
  id: number;
  name: string;
  color: string;
  leads: Lead[];
}

interface KanbanColumnProps {
  stage: KanbanStage;
  onLeadClick: (lead: Lead) => void;
  onAddLead: (stageId: number) => void;
}

export default function KanbanColumn({ stage, onLeadClick, onAddLead }: KanbanColumnProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: {
      stageId: stage.id,
    },
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const totalValue = stage.leads.reduce((sum, lead) => sum + lead.value, 0);

  if (!isHydrated) {
    return (
      <div className="flex-shrink-0 w-80 bg-muted rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-card rounded w-3/4 mb-4" />
          <div className="space-y-3">
            <div className="h-32 bg-card rounded" />
            <div className="h-32 bg-card rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 rounded-lg transition-all duration-300 ease-out ${
        isOver ? 'bg-primary/10 ring-2 ring-primary shadow-lg scale-[1.02]' : 'bg-muted'
      }`}
    >
      <div className="p-4">
        {/* Column Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full transition-transform duration-200"
                style={{ 
                  backgroundColor: stage.color,
                  transform: isOver ? 'scale(1.3)' : 'scale(1)'
                }}
              />
              <h3 className="text-sm font-heading font-semibold text-foreground">
                {stage.name}
              </h3>
              <span className="text-xs font-caption px-2 py-1 bg-card text-muted-foreground rounded">
                {stage.leads.length}
              </span>
            </div>
            <button
              onClick={() => onAddLead(stage.id)}
              className="p-1.5 rounded hover:bg-card transition-smooth focus-ring"
              aria-label="Adicionar lead"
            >
              <Icon name="PlusIcon" size={16} className="text-muted-foreground" />
            </button>
          </div>
          <div className="text-xs font-caption text-muted-foreground">
            Total: R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Leads with Sortable Context */}
        <SortableContext
          items={stage.leads.map(lead => lead.id)}
          strategy={verticalListSortingStrategy}
        >
          <div 
            className={`space-y-3 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-custom transition-all duration-300 ${
              isOver ? 'bg-accent/20 rounded-lg p-2' : ''
            }`}
          >
            {stage.leads.length === 0 ? (
              <div className={`text-center py-8 transition-all duration-300 ${
                isOver ? 'scale-105' : ''
              }`}>
                <Icon 
                  name="InboxIcon" 
                  size={32} 
                  className={`mx-auto mb-2 transition-colors duration-300 ${
                    isOver ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <p className={`text-sm transition-colors duration-300 ${
                  isOver ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {isOver ? 'Solte aqui' : 'Nenhum lead nesta etapa'}
                </p>
              </div>
            ) : (
              stage.leads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onCardClick={onLeadClick}
                  stageId={stage.id}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}