'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import IntegrationCard from './IntegrationCard';
import ConfigurationSection from './ConfigurationSection';
import SLAConfiguration from './SLAConfiguration';
import LeadOriginManager from './LeadOriginManager';
import ThemeToggle from './ThemeToggle';
import WhatsAppWebConfig from './WhatsAppWebConfig';



interface Integration {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'pending';
  lastSync?: string;
}

interface ConfigField {
  id: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'number' | 'select' | 'toggle';
  value: string | boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helpText?: string;
}

interface SLARule {
  id: string;
  name: string;
  threshold: number;
  unit: 'minutes' | 'hours';
  alertEnabled: boolean;
  escalationEnabled: boolean;
}

interface LeadOrigin {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  leadCount: number;
}

type TabType = 'integrations' | 'whatsapp' | 'whatsapp-web' | 'instagram' | 'facebook' | 'ecommerce' | 'sla' | 'origins' | 'theme';

export default function SettingsInteractive() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('integrations');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [integrations] = useState<Integration[]>([
    {
      id: 'whatsapp',
      title: 'WhatsApp Business API',
      description: 'Integração oficial do WhatsApp para mensagens em massa',
      icon: 'ChatBubbleLeftRightIcon',
      status: 'connected',
      lastSync: '19/01/2026 às 17:45',
    },
    {
      id: 'instagram',
      title: 'Instagram Direct',
      description: 'Centralize mensagens do Instagram Direct',
      icon: 'PhotoIcon',
      status: 'connected',
      lastSync: '19/01/2026 às 17:30',
    },
    {
      id: 'facebook',
      title: 'Facebook Pixel',
      description: 'Rastreamento de eventos e conversões',
      icon: 'ChartBarIcon',
      status: 'pending',
    },
    {
      id: 'ecommerce',
      title: 'E-commerce Webhooks',
      description: 'Integração com plataformas de e-commerce',
      icon: 'ShoppingCartIcon',
      status: 'disconnected',
    },
  ]);

  const [whatsappConfig, setWhatsappConfig] = useState<ConfigField[]>([
    {
      id: 'apiKey',
      label: 'Chave da API',
      type: 'password',
      value: '••••••••••••••••',
      placeholder: 'Cole sua chave da API aqui',
      helpText: 'Obtenha sua chave no painel do WhatsApp Business',
    },
    {
      id: 'webhookUrl',
      label: 'URL do Webhook',
      type: 'url',
      value: 'https://api.multitenant-crm.com/webhooks/whatsapp',
      helpText: 'Configure esta URL no painel do WhatsApp',
    },
    {
      id: 'phoneNumber',
      label: 'Número do WhatsApp',
      type: 'text',
      value: '+55 11 98765-4321',
      placeholder: '+55 11 00000-0000',
    },
    {
      id: 'massMessaging',
      label: 'Mensagens em Massa',
      type: 'toggle',
      value: true,
      helpText: 'Permite envio de mensagens para múltiplos contatos',
    },
    {
      id: 'autoResponse',
      label: 'Resposta Automática',
      type: 'toggle',
      value: true,
      helpText: 'Ativa respostas automáticas do chatbot',
    },
  ]);

  const [instagramConfig, setInstagramConfig] = useState<ConfigField[]>([
    {
      id: 'accountId',
      label: 'ID da Conta Instagram',
      type: 'text',
      value: '@empresademo',
      placeholder: '@suaconta',
    },
    {
      id: 'accessToken',
      label: 'Token de Acesso',
      type: 'password',
      value: '••••••••••••••••',
      placeholder: 'Cole seu token de acesso',
      helpText: 'Token gerado no Facebook Developer',
    },
    {
      id: 'syncInterval',
      label: 'Intervalo de Sincronização',
      type: 'select',
      value: '5',
      options: [
        { value: '1', label: '1 minuto' },
        { value: '5', label: '5 minutos' },
        { value: '15', label: '15 minutos' },
        { value: '30', label: '30 minutos' },
      ],
      helpText: 'Frequência de verificação de novas mensagens',
    },
    {
      id: 'autoSync',
      label: 'Sincronização Automática',
      type: 'toggle',
      value: true,
    },
  ]);

  const [facebookConfig, setFacebookConfig] = useState<ConfigField[]>([
    {
      id: 'pixelId',
      label: 'ID do Pixel',
      type: 'text',
      value: '',
      placeholder: '1234567890123456',
      helpText: 'Encontre seu Pixel ID no Gerenciador de Eventos',
    },
    {
      id: 'trackPageView',
      label: 'Rastrear Visualizações de Página',
      type: 'toggle',
      value: true,
    },
    {
      id: 'trackLeadEvents',
      label: 'Rastrear Eventos de Lead',
      type: 'toggle',
      value: true,
      helpText: 'Envia eventos quando leads são criados ou convertidos',
    },
    {
      id: 'trackPurchase',
      label: 'Rastrear Compras',
      type: 'toggle',
      value: false,
    },
  ]);

  const [ecommerceConfig, setEcommerceConfig] = useState<ConfigField[]>([
    {
      id: 'platform',
      label: 'Plataforma',
      type: 'select',
      value: 'shopify',
      options: [
        { value: 'shopify', label: 'Shopify' },
        { value: 'woocommerce', label: 'WooCommerce' },
        { value: 'vtex', label: 'VTEX' },
        { value: 'custom', label: 'Personalizado' },
      ],
    },
    {
      id: 'webhookUrl',
      label: 'URL do Webhook',
      type: 'url',
      value: 'https://api.multitenant-crm.com/webhooks/ecommerce',
      helpText: 'Configure esta URL na sua plataforma de e-commerce',
    },
    {
      id: 'cartAbandonment',
      label: 'Carrinho Abandonado',
      type: 'toggle',
      value: true,
      helpText: 'Cria leads automaticamente para carrinhos abandonados',
    },
    {
      id: 'orderTracking',
      label: 'Rastreamento de Pedidos',
      type: 'toggle',
      value: true,
    },
  ]);

  const [slaRules, setSlaRules] = useState<SLARule[]>([
    {
      id: '1',
      name: 'Resposta Inicial',
      threshold: 15,
      unit: 'minutes',
      alertEnabled: true,
      escalationEnabled: false,
    },
    {
      id: '2',
      name: 'Resolução de Dúvidas',
      threshold: 2,
      unit: 'hours',
      alertEnabled: true,
      escalationEnabled: true,
    },
  ]);

  const [leadOrigins, setLeadOrigins] = useState<LeadOrigin[]>([
    {
      id: '1',
      name: 'Instagram',
      color: '#e4405f',
      isActive: true,
      leadCount: 245,
    },
    {
      id: '2',
      name: 'WhatsApp',
      color: '#25d366',
      isActive: true,
      leadCount: 189,
    },
    {
      id: '3',
      name: 'Site',
      color: '#1fc2a9',
      isActive: true,
      leadCount: 156,
    },
    {
      id: '4',
      name: 'Facebook',
      color: '#1877f2',
      isActive: false,
      leadCount: 78,
    },
  ]);

  const tabs = [
    { id: 'integrations' as TabType, label: 'Visão Geral', icon: 'Squares2X2Icon' },
    { id: 'whatsapp' as TabType, label: 'WhatsApp API', icon: 'ChatBubbleLeftRightIcon' },
    { id: 'whatsapp-web' as TabType, label: 'WhatsApp Web', icon: 'QrCodeIcon' },
    { id: 'instagram' as TabType, label: 'Instagram', icon: 'PhotoIcon' },
    { id: 'facebook' as TabType, label: 'Facebook Pixel', icon: 'ChartBarIcon' },
    { id: 'ecommerce' as TabType, label: 'E-commerce', icon: 'ShoppingCartIcon' },
    { id: 'sla' as TabType, label: 'SLA', icon: 'ClockIcon' },
    { id: 'origins' as TabType, label: 'Origens', icon: 'TagIcon' },
    { id: 'theme' as TabType, label: 'Tema', icon: 'SwatchIcon' },
  ];

  const handleConfigFieldChange = (
    config: ConfigField[],
    setConfig: React.Dispatch<React.SetStateAction<ConfigField[]>>,
    fieldId: string,
    value: string | boolean
  ) => {
    setConfig(
      config.map((field) =>
        field.id === fieldId ? { ...field, value } : field
      )
    );
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert('Configurações salvas com sucesso!');
  };

  const handleTestIntegration = (integrationId: string) => {
    alert(`Testando integração ${integrationId}...`);
  };

  const handleSLARuleChange = (
    ruleId: string,
    field: keyof SLARule,
    value: any
  ) => {
    setSlaRules(
      slaRules.map((rule) =>
        rule.id === ruleId ? { ...rule, [field]: value } : rule
      )
    );
  };

  const handleAddSLARule = () => {
    const newRule: SLARule = {
      id: Date.now().toString(),
      name: 'Nova Regra',
      threshold: 30,
      unit: 'minutes',
      alertEnabled: true,
      escalationEnabled: false,
    };
    setSlaRules([...slaRules, newRule]);
  };

  const handleRemoveSLARule = (ruleId: string) => {
    setSlaRules(slaRules.filter((rule) => rule.id !== ruleId));
  };

  const handleAddLeadOrigin = (name: string, color: string) => {
    const newOrigin: LeadOrigin = {
      id: Date.now().toString(),
      name,
      color,
      isActive: true,
      leadCount: 0,
    };
    setLeadOrigins([...leadOrigins, newOrigin]);
  };

  const handleToggleLeadOrigin = (originId: string) => {
    setLeadOrigins(
      leadOrigins.map((origin) =>
        origin.id === originId
          ? { ...origin, isActive: !origin.isActive }
          : origin
      )
    );
  };

  const handleDeleteLeadOrigin = (originId: string) => {
    if (confirm('Tem certeza que deseja excluir esta origem?')) {
      setLeadOrigins(leadOrigins.filter((origin) => origin.id !== originId));
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    console.log('Theme changed to:', theme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
            Configurações e Integrações
          </h1>
          <p className="text-muted-foreground">
            Gerencie integrações, configurações de sistema e preferências
          </p>
        </div>

        {/* Tabs - Desktop */}
        <div className="hidden lg:block mb-8">
          <div className="border-b border-border">
            <nav className="flex gap-6 overflow-x-auto scrollbar-custom">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-smooth whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Icon name={tab.icon as any} size={20} />
                  <span className="text-sm font-caption font-medium">
                    {tab.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tabs - Mobile */}
        <div className="lg:hidden mb-6">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabType)}
            className="w-full h-12 px-4 bg-card border border-border rounded-lg text-sm font-caption text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'integrations' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {integrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  title={integration.title}
                  description={integration.description}
                  icon={integration.icon}
                  status={integration.status}
                  lastSync={integration.lastSync}
                  onConfigure={() => {
                    // Navigate to specific config tab
                    if (integration.id === 'whatsapp') {
                      setActiveTab('whatsapp');
                    } else {
                      setActiveTab(integration.id as TabType);
                    }
                  }}
                  onTest={() => handleTestIntegration(integration.id)}
                />
              ))}
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <ConfigurationSection
              title="Configuração do WhatsApp Business API"
              description="Configure a integração oficial do WhatsApp para envio de mensagens"
              fields={whatsappConfig}
              onFieldChange={(fieldId, value) =>
                handleConfigFieldChange(
                  whatsappConfig,
                  setWhatsappConfig,
                  fieldId,
                  value
                )
              }
              onSave={handleSaveConfig}
              onCancel={() => setActiveTab('integrations')}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'whatsapp-web' && <WhatsAppWebConfig />}

          {activeTab === 'instagram' && (
            <ConfigurationSection
              title="Configuração do Instagram Direct"
              description="Centralize e gerencie mensagens do Instagram Direct"
              fields={instagramConfig}
              onFieldChange={(fieldId, value) =>
                handleConfigFieldChange(
                  instagramConfig,
                  setInstagramConfig,
                  fieldId,
                  value
                )
              }
              onSave={handleSaveConfig}
              onCancel={() => setActiveTab('integrations')}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'facebook' && (
            <ConfigurationSection
              title="Configuração do Facebook Pixel"
              description="Configure o rastreamento de eventos e conversões"
              fields={facebookConfig}
              onFieldChange={(fieldId, value) =>
                handleConfigFieldChange(
                  facebookConfig,
                  setFacebookConfig,
                  fieldId,
                  value
                )
              }
              onSave={handleSaveConfig}
              onCancel={() => setActiveTab('integrations')}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'ecommerce' && (
            <ConfigurationSection
              title="Configuração de E-commerce"
              description="Integre com plataformas de e-commerce para automação de leads"
              fields={ecommerceConfig}
              onFieldChange={(fieldId, value) =>
                handleConfigFieldChange(
                  ecommerceConfig,
                  setEcommerceConfig,
                  fieldId,
                  value
                )
              }
              onSave={handleSaveConfig}
              onCancel={() => setActiveTab('integrations')}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'sla' && (
            <SLAConfiguration
              rules={slaRules}
              onRuleChange={handleSLARuleChange}
              onAddRule={handleAddSLARule}
              onRemoveRule={handleRemoveSLARule}
            />
          )}

          {activeTab === 'origins' && (
            <LeadOriginManager
              origins={leadOrigins}
              onAddOrigin={handleAddLeadOrigin}
              onToggleOrigin={handleToggleLeadOrigin}
              onDeleteOrigin={handleDeleteLeadOrigin}
            />
          )}

          {activeTab === 'theme' && (
            <ThemeToggle onThemeChange={handleThemeChange} />
          )}
        </div>
      </div>
    </div>
  );
}