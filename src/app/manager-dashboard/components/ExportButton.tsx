'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ExportButtonProps {
  onExport: (format: 'excel' | 'pdf') => void;
}

export default function ExportButton({ onExport }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: 'excel' | 'pdf') => {
    onExport(format);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-caption font-medium hover:opacity-90 transition-smooth focus-ring"
      >
        <Icon name="ArrowDownTrayIcon" size={18} />
        <span>Exportar</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-dropdown"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-warm-lg z-dropdown animate-fade-in">
            <div className="p-2">
              <button
                onClick={() => handleExport('excel')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-caption text-foreground hover:bg-muted transition-smooth"
              >
                <Icon name="DocumentTextIcon" size={18} className="text-success" />
                <span>Exportar Excel</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-caption text-foreground hover:bg-muted transition-smooth"
              >
                <Icon name="DocumentIcon" size={18} className="text-error" />
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}