'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface LeadOrigin {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  leadCount: number;
}

interface LeadOriginManagerProps {
  origins: LeadOrigin[];
  onAddOrigin: (name: string, color: string) => void;
  onToggleOrigin: (originId: string) => void;
  onDeleteOrigin: (originId: string) => void;
}

const PRESET_COLORS = [
  '#1fc2a9',
  '#107c65',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
];

export default function LeadOriginManager({
  origins,
  onAddOrigin,
  onToggleOrigin,
  onDeleteOrigin,
}: LeadOriginManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOriginName, setNewOriginName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [customColor, setCustomColor] = useState('');
  const [colorHistory, setColorHistory] = useState<string[]>([]);

  const handleAddOrigin = () => {
    if (newOriginName.trim()) {
      const colorToUse = customColor || selectedColor;
      onAddOrigin(newOriginName.trim(), colorToUse);
      
      if (customColor && !colorHistory.includes(customColor)) {
        setColorHistory([customColor, ...colorHistory.slice(0, 6)]);
      }
      
      setNewOriginName('');
      setCustomColor('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
            Origens de Leads
          </h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as fontes de origem dos seus leads
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-caption font-medium hover:opacity-90 transition-smooth focus-ring flex items-center gap-2"
        >
          <Icon name={showAddForm ? 'XMarkIcon' : 'PlusIcon'} size={18} />
          <span>{showAddForm ? 'Cancelar' : 'Nova Origem'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome da Origem
              </label>
              <input
                type="text"
                value={newOriginName}
                onChange={(e) => setNewOriginName(e.target.value)}
                placeholder="Ex: Instagram, Facebook, Site"
                className="w-full h-10 px-4 bg-background border border-input rounded-lg text-sm font-caption text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cor de Identificação
              </label>
              <div className="flex items-center gap-3 mb-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setCustomColor('');
                    }}
                    className={`w-10 h-10 rounded-lg transition-smooth focus-ring ${
                      selectedColor === color && !customColor
                        ? 'ring-2 ring-offset-2 ring-primary' :''
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Selecionar cor ${color}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="RGB personalizado (ex: #ff5733)"
                  className="flex-1 h-10 px-4 bg-background border border-input rounded-lg text-sm font-caption text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth"
                />
                {customColor && (
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-border"
                    style={{ backgroundColor: customColor }}
                  />
                )}
              </div>

              {colorHistory.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Cores recentes:</p>
                  <div className="flex items-center gap-2">
                    {colorHistory.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCustomColor(color);
                          setSelectedColor('');
                        }}
                        className="w-8 h-8 rounded-lg transition-smooth focus-ring"
                        style={{ backgroundColor: color }}
                        aria-label={`Usar cor ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleAddOrigin}
              disabled={!newOriginName.trim()}
              className="w-full h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-caption font-medium hover:opacity-90 transition-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Adicionar Origem
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {origins.map((origin) => (
          <div
            key={origin.id}
            className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-lg"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: origin.color }}
              />
              <div>
                <p className="text-sm font-medium text-foreground">{origin.name}</p>
                <p className="text-xs text-muted-foreground">
                  {origin.leadCount} leads
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleOrigin(origin.id)}
                className={`relative w-12 h-6 rounded-full transition-smooth focus-ring ${
                  origin.isActive ? 'bg-primary' : 'bg-muted'
                }`}
                aria-label={origin.isActive ? 'Desativar origem' : 'Ativar origem'}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    origin.isActive ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>

              <button
                onClick={() => onDeleteOrigin(origin.id)}
                className="p-2 text-error hover:bg-error/10 rounded-lg transition-smooth focus-ring"
                aria-label="Excluir origem"
              >
                <Icon name="TrashIcon" size={18} />
              </button>
            </div>
          </div>
        ))}

        {origins.length === 0 && (
          <div className="text-center py-12">
            <Icon
              name="TagIcon"
              size={48}
              className="text-muted-foreground mx-auto mb-4"
            />
            <p className="text-sm text-muted-foreground">
              Nenhuma origem de lead configurada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}