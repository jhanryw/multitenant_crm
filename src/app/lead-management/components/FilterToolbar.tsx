'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterToolbarProps {
  onFilterChange: (filters: FilterState) => void;
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

export default function FilterToolbar({ onFilterChange }: FilterToolbarProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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

  useState(() => {
    setIsHydrated(true);
  });

  const sellers = ['Todos', 'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa'];
  const sectors = ['Todos', 'Varejo', 'Atacado', 'E-commerce', 'Corporativo'];
  const sources = ['Todos', 'WhatsApp', 'Instagram', 'Site', 'Indicação', 'Facebook'];
  const priorities = ['Todas', 'Alta', 'Média', 'Baixa'];
  const slaStatuses = ['Todos', 'OK', 'Atenção', 'Crítico'];

  const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      search: '',
      seller: '',
      sector: '',
      source: '',
      dateFrom: '',
      dateTo: '',
      tags: [],
      priority: '',
      slaStatus: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFilterCount = Object.values(filters).filter((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== '';
  }).length;

  if (!isHydrated) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Search and Toggle */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Icon
            name="MagnifyingGlassIcon"
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-background border border-input rounded-lg text-sm font-caption text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-smooth"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 h-10 rounded-lg font-caption font-medium transition-smooth focus-ring ${
            showFilters
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          <Icon name="FunnelIcon" size={18} />
          <span>Filtros</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="px-4 h-10 rounded-lg font-caption font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth focus-ring"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div>
            <label className="block text-xs font-caption text-muted-foreground mb-2">
              Vendedor
            </label>
            <select
              value={filters.seller}
              onChange={(e) => handleFilterChange('seller', e.target.value)}
              className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm font-caption text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-smooth"
            >
              {sellers.map((seller) => (
                <option key={seller} value={seller === 'Todos' ? '' : seller}>
                  {seller}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-caption text-muted-foreground mb-2">
              Setor
            </label>
            <select
              value={filters.sector}
              onChange={(e) => handleFilterChange('sector', e.target.value)}
              className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm font-caption text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-smooth"
            >
              {sectors.map((sector) => (
                <option key={sector} value={sector === 'Todos' ? '' : sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-caption text-muted-foreground mb-2">
              Origem
            </label>
            <select
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm font-caption text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-smooth"
            >
              {sources.map((source) => (
                <option key={source} value={source === 'Todos' ? '' : source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-caption text-muted-foreground mb-2">
              Prioridade
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm font-caption text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-smooth"
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority === 'Todas' ? '' : priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-caption text-muted-foreground mb-2">
              Status SLA
            </label>
            <select
              value={filters.slaStatus}
              onChange={(e) => handleFilterChange('slaStatus', e.target.value)}
              className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm font-caption text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-smooth"
            >
              {slaStatuses.map((status) => (
                <option key={status} value={status === 'Todos' ? '' : status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-caption text-muted-foreground mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm font-caption text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-smooth"
            />
          </div>

          <div>
            <label className="block text-xs font-caption text-muted-foreground mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full h-10 px-3 bg-background border border-input rounded-lg text-sm font-caption text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-smooth"
            />
          </div>
        </div>
      )}
    </div>
  );
}