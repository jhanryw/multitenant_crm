import Icon from '@/components/ui/AppIcon';

interface SLARule {
  id: string;
  name: string;
  threshold: number;
  unit: 'minutes' | 'hours';
  alertEnabled: boolean;
  escalationEnabled: boolean;
}

interface SLAConfigurationProps {
  rules: SLARule[];
  onRuleChange: (ruleId: string, field: keyof SLARule, value: any) => void;
  onAddRule: () => void;
  onRemoveRule: (ruleId: string) => void;
}

export default function SLAConfiguration({
  rules,
  onRuleChange,
  onAddRule,
  onRemoveRule,
}: SLAConfigurationProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
            Configuração de SLA
          </h3>
          <p className="text-sm text-muted-foreground">
            Defina limites de tempo de resposta e regras de escalação
          </p>
        </div>
        <button
          onClick={onAddRule}
          className="h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-caption font-medium hover:opacity-90 transition-smooth focus-ring flex items-center gap-2"
        >
          <Icon name="PlusIcon" size={18} />
          <span>Nova Regra</span>
        </button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-muted/50 border border-border rounded-lg p-4"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome da Regra
                </label>
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => onRuleChange(rule.id, 'name', e.target.value)}
                  placeholder="Ex: Resposta Inicial"
                  className="w-full h-10 px-4 bg-background border border-input rounded-lg text-sm font-caption text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Limite
                  </label>
                  <input
                    type="number"
                    value={rule.threshold}
                    onChange={(e) =>
                      onRuleChange(rule.id, 'threshold', parseInt(e.target.value))
                    }
                    min="1"
                    className="w-full h-10 px-4 bg-background border border-input rounded-lg text-sm font-caption text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Unidade
                  </label>
                  <select
                    value={rule.unit}
                    onChange={(e) =>
                      onRuleChange(rule.id, 'unit', e.target.value as 'minutes' | 'hours')
                    }
                    className="w-full h-10 px-4 bg-background border border-input rounded-lg text-sm font-caption text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth"
                  >
                    <option value="minutes">Minutos</option>
                    <option value="hours">Horas</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      onRuleChange(rule.id, 'alertEnabled', !rule.alertEnabled)
                    }
                    className={`relative w-12 h-6 rounded-full transition-smooth focus-ring ${
                      rule.alertEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                    aria-label="Ativar alertas"
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        rule.alertEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-foreground">Alertas</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      onRuleChange(rule.id, 'escalationEnabled', !rule.escalationEnabled)
                    }
                    className={`relative w-12 h-6 rounded-full transition-smooth focus-ring ${
                      rule.escalationEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                    aria-label="Ativar escalação"
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        rule.escalationEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-foreground">Escalação</span>
                </div>
              </div>

              <button
                onClick={() => onRemoveRule(rule.id)}
                className="p-2 text-error hover:bg-error/10 rounded-lg transition-smooth focus-ring"
                aria-label="Remover regra"
              >
                <Icon name="TrashIcon" size={18} />
              </button>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="text-center py-12">
            <Icon
              name="ClockIcon"
              size={48}
              className="text-muted-foreground mx-auto mb-4"
            />
            <p className="text-sm text-muted-foreground">
              Nenhuma regra de SLA configurada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}