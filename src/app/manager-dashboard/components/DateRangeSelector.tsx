'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface DateRange {
  label: string;
  value: string;
}

interface DateRangeSelectorProps {
  onRangeChange: (range: string) => void;
}

export default function DateRangeSelector({ onRangeChange }: DateRangeSelectorProps) {
  const [selectedRange, setSelectedRange] = useState('30days');
  const [isOpen, setIsOpen] = useState(false);

  const dateRanges: DateRange[] = [
    { label: 'Últimos 7 dias', value: '7days' },
    { label: 'Últimos 30 dias', value: '30days' },
    { label: 'Últimos 90 dias', value: '90days' },
    { label: 'Este mês', value: 'thisMonth' },
    { label: 'Mês anterior', value: 'lastMonth' },
    { label: 'Este ano', value: 'thisYear' },
  ];

  const handleRangeSelect = (value: string) => {
    setSelectedRange(value);
    onRangeChange(value);
    setIsOpen(false);
  };

  const selectedLabel = dateRanges.find(r => r.value === selectedRange)?.label || 'Selecionar período';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-10 px-4 bg-card border border-border rounded-lg text-sm font-caption text-foreground hover:bg-muted transition-smooth focus-ring"
      >
        <Icon name="CalendarIcon" size={18} className="text-muted-foreground" />
        <span>{selectedLabel}</span>
        <Icon 
          name={isOpen ? 'ChevronUpIcon' : 'ChevronDownIcon'} 
          size={16} 
          className="text-muted-foreground ml-2"
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-dropdown"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-warm-lg z-dropdown animate-fade-in">
            <div className="p-2">
              {dateRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => handleRangeSelect(range.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-caption transition-smooth ${
                    selectedRange === range.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}