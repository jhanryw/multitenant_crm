'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { automationsService, LeadAutomation } from '@/services/automations.service';

export default function AutomationsConfig() {
  const [automations, setAutomations] = useState<LeadAutomation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewAutomationModal, setShowNewAutomationModal] = useState(false);

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    try {
      setIsLoading(true);
      const companyId = 'demo-company-id'; // Replace with actual company ID
      const automationsData = await automationsService.getAllAutomations(companyId);
      setAutomations(automationsData);
    } catch (error: any) {
      console.error('Error loading automations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutomation = async (automationId: string, isActive: boolean) => {
    try {
      await automationsService.toggleAutomation(automationId, !isActive);
      await loadAutomations();
    } catch (error: any) {
      console.error('Error toggling automation:', error);
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta automação?')) return;

    try {
      await automationsService.deleteAutomation(automationId);
      await loadAutomations();
    } catch (error: any) {
      console.error('Error deleting automation:', error);
    }
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      time_based: 'Tempo decorrido',
      status_change: 'Mudança de status',
      stage_change: 'Mudança de etapa',
      tag_added: 'Tag adicionada',
      inactivity: 'Inatividade'
    };
    return labels[trigger] || trigger;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      send_message: 'Enviar mensagem',
      change_status: 'Alterar status',
      assign_seller: 'Atribuir vendedor',
      add_tag: 'Adicionar tag',
      notify_user: 'Notificar usuário'
    };
    return labels[action] || action;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-card rounded-lg" />
        <div className="h-32 bg-card rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Automações de Leads
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure regras automáticas para gerenciar seus leads
          </p>
        </div>
        <button
          onClick={() => setShowNewAutomationModal(true)}
          className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-caption font-medium transition-smooth focus-ring"
        >
          <Icon name="PlusIcon" size={18} />
          Nova Automação
        </button>
      </div>

      {/* Automation Examples */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="InformationCircleIcon" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-caption font-semibold text-blue-900 mb-2">
              Exemplos de Automações
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Transferir lead após X dias sem resposta</li>
              <li>• Enviar mensagem ao mudar de etapa</li>
              <li>• Notificar gestor quando lead ficar inativo por 7 dias</li>
              <li>• Adicionar tag "VIP" quando valor &gt; R$ 50.000</li>
              <li>• Atribuir automaticamente ao vendedor com menos leads</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Automations List */}
      {automations.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Icon name="BoltIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Nenhuma automação configurada
          </p>
          <button
            onClick={() => setShowNewAutomationModal(true)}
            className="text-primary hover:underline font-caption"
          >
            Criar primeira automação
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {automations.map((automation) => (
            <div
              key={automation.id}
              className={`bg-card rounded-lg border border-border p-6 ${
                automation.is_active ? '' : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-caption font-semibold text-foreground">
                      {automation.name}
                    </h3>
                    <span
                      className={`text-xs font-caption px-3 py-1 rounded-full ${
                        automation.is_active
                          ? 'bg-green-100 text-green-700' :'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {automation.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  {automation.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {automation.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="BoltIcon" size={16} className="text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Gatilho: <span className="text-foreground font-medium">{getTriggerLabel(automation.trigger_type)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="ArrowRightIcon" size={16} className="text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Ação: <span className="text-foreground font-medium">{getActionLabel(automation.action_type)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAutomation(automation.id, automation.is_active)}
                    className={`p-2 rounded-lg transition-smooth ${
                      automation.is_active
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={automation.is_active ? 'Desativar' : 'Ativar'}
                  >
                    <Icon name={automation.is_active ? 'PauseIcon' : 'PlayIcon'} size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteAutomation(automation.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-smooth"
                    title="Excluir"
                  >
                    <Icon name="TrashIcon" size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Automation Modal - Placeholder */}
      {showNewAutomationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Nova Automação
              </h3>
              <button
                onClick={() => setShowNewAutomationModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-smooth"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="text-center py-12">
              <Icon name="BoltIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Interface de criação de automação em desenvolvimento
              </p>
              <button
                onClick={() => setShowNewAutomationModal(false)}
                className="px-6 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-caption font-medium transition-smooth focus-ring"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}