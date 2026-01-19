'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface BulkActionsBarProps {
  selectedCount: number;
  onAssign: () => void;
  onUpdateStatus: () => void;
  onAddTags: () => void;
  onExport: () => void;
  onClearSelection: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onAssign,
  onUpdateStatus,
  onAddTags,
  onExport,
  onClearSelection,
}: BulkActionsBarProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useState(() => {
    setIsHydrated(true);
  });

  if (!isHydrated || selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-dropdown animate-slide-up">
      <div className="bg-card border border-border rounded-lg shadow-warm-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-heading font-semibold">
              {selectedCount}
            </div>
            <span className="text-sm font-caption text-foreground">
              {selectedCount === 1 ? 'lead selecionado' : 'leads selecionados'}
            </span>
          </div>

          <div className="w-px h-6 bg-border" />

          <div className="flex items-center gap-2">
            <button
              onClick={onAssign}
              className="flex items-center gap-2 px-3 h-9 rounded-lg bg-muted text-foreground hover:bg-muted/80 font-caption font-medium transition-smooth focus-ring"
            >
              <Icon name="UserIcon" size={16} />
              <span className="hidden sm:inline">Atribuir</span>
            </button>

            <button
              onClick={onUpdateStatus}
              className="flex items-center gap-2 px-3 h-9 rounded-lg bg-muted text-foreground hover:bg-muted/80 font-caption font-medium transition-smooth focus-ring"
            >
              <Icon name="ArrowPathIcon" size={16} />
              <span className="hidden sm:inline">Status</span>
            </button>

            <button
              onClick={onAddTags}
              className="flex items-center gap-2 px-3 h-9 rounded-lg bg-muted text-foreground hover:bg-muted/80 font-caption font-medium transition-smooth focus-ring"
            >
              <Icon name="TagIcon" size={16} />
              <span className="hidden sm:inline">Tags</span>
            </button>

            <button
              onClick={onExport}
              className="flex items-center gap-2 px-3 h-9 rounded-lg bg-muted text-foreground hover:bg-muted/80 font-caption font-medium transition-smooth focus-ring"
            >
              <Icon name="ArrowDownTrayIcon" size={16} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>

          <div className="w-px h-6 bg-border" />

          <button
            onClick={onClearSelection}
            className="p-2 rounded-lg hover:bg-muted transition-smooth focus-ring"
            aria-label="Limpar seleção"
          >
            <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}