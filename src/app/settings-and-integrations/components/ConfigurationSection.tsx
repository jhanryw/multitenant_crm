import Icon from '@/components/ui/AppIcon';

interface ConfigField {
  id: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'number' | 'select' | 'toggle';
  value: string | boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helpText?: string;
}

interface ConfigurationSectionProps {
  title: string;
  description: string;
  fields: ConfigField[];
  onFieldChange: (fieldId: string, value: string | boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export default function ConfigurationSection({
  title,
  description,
  fields,
  onFieldChange,
  onSave,
  onCancel,
  isSaving = false,
}: ConfigurationSectionProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-foreground mb-2"
            >
              {field.label}
            </label>

            {field.type === 'toggle' ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onFieldChange(field.id, !field.value)}
                  className={`relative w-12 h-6 rounded-full transition-smooth focus-ring ${
                    field.value ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-label={field.label}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      field.value ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-sm text-muted-foreground">
                  {field.value ? 'Ativado' : 'Desativado'}
                </span>
              </div>
            ) : field.type === 'select' ? (
              <select
                id={field.id}
                value={field.value as string}
                onChange={(e) => onFieldChange(field.id, e.target.value)}
                className="w-full h-12 px-4 bg-background border border-input rounded-lg text-sm font-caption text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth"
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.id}
                type={field.type}
                value={field.value as string}
                onChange={(e) => onFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full h-12 px-4 bg-background border border-input rounded-lg text-sm font-caption text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth"
              />
            )}

            {field.helpText && (
              <p className="mt-2 text-xs text-muted-foreground flex items-start gap-2">
                <Icon name="InformationCircleIcon" size={14} className="mt-0.5 flex-shrink-0" />
                <span>{field.helpText}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-caption font-medium hover:opacity-90 transition-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="h-10 px-6 bg-muted text-foreground rounded-lg text-sm font-caption font-medium hover:bg-muted/80 transition-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}