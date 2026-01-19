'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import FilterToolbar from './FilterToolbar';
import KanbanColumn from './KanbanColumn';
import LeadDetailModal from './LeadDetailModal';
import BulkActionsBar from './BulkActionsBar';
import Icon from '@/components/ui/AppIcon';
import LeadCard from '@/app/lead-management/components/LeadCard';


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

interface KanbanStage {
  id: number;
  name: string;
  color: string;
  leads: Lead[];
}

interface FilterState {
  search: string;
  seller: string;
  sector: string;
  source: string;
  dateFrom: string;
  dateTo: string;
  tags: string[];
  priority: string;
  slaStatus: string;
}

const mockLeads: Lead[] = [
  {
    id: 1,
    name: 'Carlos Mendes',
    email: 'carlos.mendes@email.com',
    phone: '(11) 98765-4321',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    avatarAlt: 'Homem de negócios sorridente com camisa azul em escritório moderno',
    source: 'WhatsApp',
    assignedSeller: 'João Silva',
    tags: [
      { id: 1, name: 'Novo Lead', color: '#1fc2a9', type: 'automatic' },
      { id: 2, name: 'Varejo', color: '#f59e0b', type: 'manual' },
    ],
    priority: 'high',
    slaStatus: 'warning',
    slaTimeRemaining: '2h restantes',
    lastActivity: 'Há 30 min',
    value: 15000,
    sector: 'Varejo',
    createdAt: '15/01/2026',
    activities: [
      {
        id: 1,
        type: 'message',
        description: 'Mensagem enviada via WhatsApp',
        timestamp: '19/01/2026 15:30',
        user: 'João Silva',
      },
      {
        id: 2,
        type: 'status_change',
        description: 'Status alterado para "Contato Inicial"',
        timestamp: '19/01/2026 14:00',
        user: 'Sistema',
      },
    ],
    notes: 'Cliente interessado em produtos para revenda. Solicitou catálogo completo.',
  },
  {
    id: 2,
    name: 'Fernanda Lima',
    email: 'fernanda.lima@empresa.com.br',
    phone: '(21) 97654-3210',
    avatar: 'https://images.pixabay.com/photo/2016/11/21/12/42/beard-1845166_1280.jpg',
    avatarAlt: 'Mulher profissional com óculos e blazer cinza em ambiente corporativo',
    source: 'Instagram',
    assignedSeller: 'Maria Santos',
    tags: [
      { id: 3, name: 'Qualificado', color: '#10b981', type: 'automatic' },
      { id: 4, name: 'E-commerce', color: '#8b5cf6', type: 'manual' },
    ],
    priority: 'medium',
    slaStatus: 'ok',
    slaTimeRemaining: '6h restantes',
    lastActivity: 'Há 1h',
    value: 8500,
    sector: 'E-commerce',
    createdAt: '18/01/2026',
    activities: [
      {
        id: 3,
        type: 'call',
        description: 'Ligação realizada - Cliente atendeu',
        timestamp: '19/01/2026 16:45',
        user: 'Maria Santos',
      },
      {
        id: 4,
        type: 'note',
        description: 'Anotação: Cliente quer proposta até sexta-feira',
        timestamp: '19/01/2026 16:50',
        user: 'Maria Santos',
      },
    ],
    notes: 'Proprietária de loja online. Busca fornecedor com entrega rápida.',
  },
  {
    id: 3,
    name: 'Roberto Alves',
    email: 'roberto.alves@comercio.com',
    phone: '(11) 96543-2109',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    avatarAlt: 'Homem jovem com camisa branca sorrindo em fundo azul claro',
    source: 'Site',
    assignedSeller: 'Pedro Oliveira',
    tags: [
      { id: 5, name: 'Proposta Enviada', color: '#3b82f6', type: 'automatic' },
    ],
    priority: 'high',
    slaStatus: 'critical',
    slaTimeRemaining: '30min restantes',
    lastActivity: 'Há 15 min',
    value: 25000,
    sector: 'Atacado',
    createdAt: '17/01/2026',
    activities: [
      {
        id: 5,
        type: 'email',
        description: 'Proposta comercial enviada por email',
        timestamp: '19/01/2026 17:00',
        user: 'Pedro Oliveira',
      },
    ],
    notes: 'Grande potencial. Já trabalha com concorrente mas está insatisfeito.',
  },
  {
    id: 4,
    name: 'Juliana Costa',
    email: 'juliana.costa@loja.com.br',
    phone: '(85) 95432-1098',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    avatarAlt: 'Mulher sorridente com cabelo castanho em ambiente profissional',
    source: 'Indicação',
    assignedSeller: 'Ana Costa',
    tags: [
      { id: 6, name: 'Negociação', color: '#f59e0b', type: 'automatic' },
      { id: 7, name: 'VIP', color: '#dc2626', type: 'manual' },
    ],
    priority: 'high',
    slaStatus: 'ok',
    slaTimeRemaining: '4h restantes',
    lastActivity: 'Há 45 min',
    value: 32000,
    sector: 'Corporativo',
    createdAt: '16/01/2026',
    activities: [
      {
        id: 6,
        type: 'message',
        description: 'Negociação de desconto em andamento',
        timestamp: '19/01/2026 16:30',
        user: 'Ana Costa',
      },
    ],
    notes: 'Cliente indicado por parceiro estratégico. Tratar com prioridade.',
  },
];

const mockStages: KanbanStage[] = [
  {
    id: 1,
    name: 'Novo Lead',
    color: '#94a3b8',
    leads: [mockLeads[0]],
  },
  {
    id: 2,
    name: 'Contato Inicial',
    color: '#1fc2a9',
    leads: [mockLeads[1]],
  },
  {
    id: 3,
    name: 'Qualificação',
    color: '#3b82f6',
    leads: [],
  },
  {
    id: 4,
    name: 'Proposta',
    color: '#f59e0b',
    leads: [mockLeads[2]],
  },
  {
    id: 5,
    name: 'Negociação',
    color: '#8b5cf6',
    leads: [mockLeads[3]],
  },
  {
    id: 6,
    name: 'Fechado',
    color: '#10b981',
    leads: [],
  },
];

export default function LeadManagementInteractive() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stages, setStages] = useState<KanbanStage[]>(mockStages);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    seller: '',
    sector: '',
    source: '',
    dateFrom: '',
    dateTo: '',
    tags: [],
    priority: '',
    slaStatus: '',
  });
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
  };

  const handleAddLead = (stageId: number) => {
    console.log('Add lead to stage:', stageId);
  };

  const handleBulkAssign = () => {
    console.log('Bulk assign leads:', selectedLeads);
  };

  const handleBulkUpdateStatus = () => {
    console.log('Bulk update status:', selectedLeads);
  };

  const handleBulkAddTags = () => {
    console.log('Bulk add tags:', selectedLeads);
  };

  const handleBulkExport = () => {
    console.log('Bulk export leads:', selectedLeads);
  };

  const handleClearSelection = () => {
    setSelectedLeads([]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over) return;

    const activeStageId = active.data.current?.stageId;
    const overStageId = over.data.current?.stageId || over.id;

    if (activeStageId === overStageId) {
      const stage = stages.find(s => s.id === activeStageId);
      if (!stage) return;

      const oldIndex = stage.leads.findIndex(lead => lead.id === active.id);
      const newIndex = stage.leads.findIndex(lead => lead.id === over.id);

      if (oldIndex !== newIndex) {
        const newLeads = arrayMove(stage.leads, oldIndex, newIndex);
        setStages(stages.map(s => 
          s.id === activeStageId ? { ...s, leads: newLeads } : s
        ));
      }
    } else {
      const sourceStage = stages.find(s => s.id === activeStageId);
      const destStage = stages.find(s => s.id === overStageId);

      if (!sourceStage || !destStage) return;

      const leadToMove = sourceStage.leads.find(lead => lead.id === active.id);
      if (!leadToMove) return;

      const newSourceLeads = sourceStage.leads.filter(lead => lead.id !== active.id);
      const newDestLeads = [...destStage.leads, leadToMove];

      setStages(stages.map(stage => {
        if (stage.id === activeStageId) {
          return { ...stage, leads: newSourceLeads };
        }
        if (stage.id === overStageId) {
          return { ...stage, leads: newDestLeads };
        }
        return stage;
      }));

      console.log('Lead moved:', {
        leadId: leadToMove.id,
        from: sourceStage.name,
        to: destStage.name
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeLead = activeId
    ? stages.flatMap(s => s.leads).find(lead => lead.id === activeId)
    : null;

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-20 bg-card border-b border-border" />
          <div className="flex">
            <div className="w-60 h-screen bg-card border-r border-border" />
            <div className="flex-1 p-8">
              <div className="h-16 bg-card rounded-lg mb-6" />
              <div className="flex gap-4">
                <div className="w-80 h-96 bg-card rounded-lg" />
                <div className="w-80 h-96 bg-card rounded-lg" />
                <div className="w-80 h-96 bg-card rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        userRole="seller"
        companyName="Empresa Demo"
      />

      <div className={`transition-all duration-smooth ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <Header
          userRole="seller"
          companyName="Empresa Demo"
          userName="João Silva"
        />

        <main className="pt-20 min-h-screen">
          <div className="p-4 lg:p-8">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                  Gerenciamento de Leads
                </h1>
                <button className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-caption font-medium transition-smooth focus-ring">
                  <Icon name="PlusIcon" size={18} />
                  <span className="hidden sm:inline">Novo Lead</span>
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Visualize e gerencie seus leads através do funil de vendas
              </p>
            </div>

            {/* Filter Toolbar */}
            <FilterToolbar onFilterChange={handleFilterChange} />

            {/* Kanban Board with Enhanced Drag and Drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {stages.map((stage) => (
                    <KanbanColumn
                      key={stage.id}
                      stage={stage}
                      onLeadClick={handleLeadClick}
                      onAddLead={handleAddLead}
                    />
                  ))}
                </div>
              </div>
              <DragOverlay dropAnimation={null}>
                {activeLead ? (
                  <div className="rotate-3 scale-105 opacity-90">
                    <LeadCard
                      lead={activeLead}
                      stageId={0}
                      onCardClick={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </main>
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal lead={selectedLead} onClose={handleCloseModal} />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedLeads.length}
        onAssign={handleBulkAssign}
        onUpdateStatus={handleBulkUpdateStatus}
        onAddTags={handleBulkAddTags}
        onExport={handleBulkExport}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
}