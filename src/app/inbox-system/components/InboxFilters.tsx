'use client';

import Icon from '@/components/ui/AppIcon';

interface InboxFiltersProps {
  currentTier: 'general' | 'sector' | 'individual';
  onTierChange: (tier: 'general' | 'sector' | 'individual') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userRole: 'manager' | 'seller';
  selectedSector: string;
  onSectorChange: (sector: string) => void;
  sectors: string[];
}

export default function InboxFilters({
  currentTier,
  onTierChange,
  searchQuery,
  onSearchChange,
  userRole,
  selectedSector,
  onSectorChange,
  sectors,
}: InboxFiltersProps) {
  return (
    <div className="flex-shrink-0 bg-card border-b border-border p-4">
      {/* Search */}
      <div className="relative mb-4">
        <Icon
          name="MagnifyingGlassIcon"
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar conversas..."
          className="w-full h-12 pl-10 pr-4 bg-muted border border-input rounded-lg text-sm font-caption text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth"
        />
      </div>

      {/* Tier Filters */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => onTierChange('general')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-caption font-medium transition-smooth ${
            currentTier === 'general' ?'bg-primary text-primary-foreground shadow-warm-sm' :'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Icon name="InboxIcon" size={16} />
            <span>Geral</span>
          </div>
        </button>

        <button
          onClick={() => onTierChange('sector')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-caption font-medium transition-smooth ${
            currentTier === 'sector' ?'bg-primary text-primary-foreground shadow-warm-sm' :'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Icon name="UserGroupIcon" size={16} />
            <span>Setor</span>
          </div>
        </button>

        <button
          onClick={() => onTierChange('individual')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-caption font-medium transition-smooth ${
            currentTier === 'individual' ?'bg-primary text-primary-foreground shadow-warm-sm' :'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Icon name="UserIcon" size={16} />
            <span>Individual</span>
          </div>
        </button>
      </div>

      {/* Sector Filter (for managers in sector view) */}
      {userRole === 'manager' && currentTier === 'sector' && (
        <div className="mb-4">
          <label className="block text-sm font-caption font-medium text-foreground mb-2">
            Filtrar por Setor
          </label>
          <select
            value={selectedSector}
            onChange={(e) => onSectorChange(e.target.value)}
            className="w-full h-12 px-4 bg-muted border border-input rounded-lg text-sm font-caption text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth"
          >
            <option value="all">Todos os Setores</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quick Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <button className="px-3 py-1.5 rounded-lg text-xs font-caption font-medium bg-muted text-foreground hover:bg-muted/80 transition-smooth">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Não lidas</span>
          </div>
        </button>

        <button className="px-3 py-1.5 rounded-lg text-xs font-caption font-medium bg-muted text-foreground hover:bg-muted/80 transition-smooth">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-error" />
            <span>SLA Crítico</span>
          </div>
        </button>

        <button className="px-3 py-1.5 rounded-lg text-xs font-caption font-medium bg-muted text-foreground hover:bg-muted/80 transition-smooth">
          <div className="flex items-center gap-1.5">
            <Icon name="ChatBubbleLeftRightIcon" size={12} className="text-success" />
            <span>WhatsApp</span>
          </div>
        </button>

        <button className="px-3 py-1.5 rounded-lg text-xs font-caption font-medium bg-muted text-foreground hover:bg-muted/80 transition-smooth">
          <div className="flex items-center gap-1.5">
            <Icon name="PhotoIcon" size={12} className="text-accent" />
            <span>Instagram</span>
          </div>
        </button>
      </div>
    </div>
  );
}