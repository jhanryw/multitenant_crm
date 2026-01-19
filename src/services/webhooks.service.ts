import { supabase } from '@/lib/supabase/client';

// Types matching database schema
export type WebhookEventType = 'cart_abandoned' | 'payment_failed' | 'sale_completed' | 'checkout_started' | 'payment_pending';
export type WebhookStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
export type WhatsAppMessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

export interface WebhookConfig {
  id: string;
  companyId: string;
  endpointUrl: string;
  secretKey: string;
  isActive: boolean;
  eventsEnabled: WebhookEventType[];
  retryCount: number;
  timeoutSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEvent {
  id: string;
  companyId: string;
  eventType: WebhookEventType;
  status: WebhookStatus;
  payload: any;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  cartValue?: number;
  orderId?: string;
  leadId?: string;
  errorMessage?: string;
  retryAttempts: number;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessage {
  id: string;
  webhookEventId: string;
  companyId: string;
  leadId?: string;
  phoneNumber: string;
  messageTemplate: string;
  messageContent: string;
  status: WhatsAppMessageStatus;
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppTemplate {
  id: string;
  companyId: string;
  eventType: WebhookEventType;
  templateName: string;
  templateContent: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class WebhooksService {
  // Webhook Configurations
  async getWebhookConfigs(companyId: string): Promise<WebhookConfig[]> {
    const { data, error } = await supabase
      .from('webhook_configs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(this.convertWebhookConfig);
  }

  async createWebhookConfig(config: Partial<WebhookConfig>): Promise<WebhookConfig> {
    const { data, error } = await supabase
      .from('webhook_configs')
      .insert([{
        company_id: config.companyId,
        endpoint_url: config.endpointUrl,
        secret_key: config.secretKey,
        is_active: config.isActive ?? true,
        events_enabled: config.eventsEnabled,
        retry_count: config.retryCount ?? 3,
        timeout_seconds: config.timeoutSeconds ?? 30
      }])
      .select()
      .single();

    if (error) throw error;
    return this.convertWebhookConfig(data);
  }

  async updateWebhookConfig(id: string, updates: Partial<WebhookConfig>): Promise<WebhookConfig> {
    const { data, error } = await supabase
      .from('webhook_configs')
      .update({
        endpoint_url: updates.endpointUrl,
        secret_key: updates.secretKey,
        is_active: updates.isActive,
        events_enabled: updates.eventsEnabled,
        retry_count: updates.retryCount,
        timeout_seconds: updates.timeoutSeconds
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.convertWebhookConfig(data);
  }

  async deleteWebhookConfig(id: string): Promise<void> {
    const { error } = await supabase
      .from('webhook_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Webhook Events
  async getWebhookEvents(companyId: string, filters?: {
    eventType?: WebhookEventType;
    status?: WebhookStatus;
    startDate?: string;
    endDate?: string;
  }): Promise<WebhookEvent[]> {
    let query = supabase
      .from('webhook_events')
      .select('*')
      .eq('company_id', companyId);

    if (filters?.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.convertWebhookEvent);
  }

  async processWebhookEvent(event: Partial<WebhookEvent>): Promise<WebhookEvent> {
    const { data, error } = await supabase
      .from('webhook_events')
      .insert([{
        company_id: event.companyId,
        event_type: event.eventType,
        status: 'pending',
        payload: event.payload,
        customer_email: event.customerEmail,
        customer_phone: event.customerPhone,
        customer_name: event.customerName,
        cart_value: event.cartValue,
        order_id: event.orderId
      }])
      .select()
      .single();

    if (error) throw error;
    return this.convertWebhookEvent(data);
  }

  async retryWebhookEvent(eventId: string): Promise<WebhookEvent> {
    const { data, error } = await supabase
      .from('webhook_events')
      .update({
        status: 'retrying',
        retry_attempts: supabase.sql`retry_attempts + 1`
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return this.convertWebhookEvent(data);
  }

  // WhatsApp Messages
  async getWhatsAppMessages(companyId: string, filters?: {
    status?: WhatsAppMessageStatus;
    webhookEventId?: string;
  }): Promise<WhatsAppMessage[]> {
    let query = supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('company_id', companyId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.webhookEventId) {
      query = query.eq('webhook_event_id', filters.webhookEventId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.convertWhatsAppMessage);
  }

  async retryWhatsAppMessage(messageId: string): Promise<WhatsAppMessage> {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .update({
        status: 'queued'
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return this.convertWhatsAppMessage(data);
  }

  // WhatsApp Templates
  async getWhatsAppTemplates(companyId: string): Promise<WhatsAppTemplate[]> {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('company_id', companyId)
      .order('event_type', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.convertWhatsAppTemplate);
  }

  async createWhatsAppTemplate(template: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate> {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .insert([{
        company_id: template.companyId,
        event_type: template.eventType,
        template_name: template.templateName,
        template_content: template.templateContent,
        variables: template.variables,
        is_active: template.isActive ?? true
      }])
      .select()
      .single();

    if (error) throw error;
    return this.convertWhatsAppTemplate(data);
  }

  async updateWhatsAppTemplate(id: string, updates: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate> {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .update({
        template_name: updates.templateName,
        template_content: updates.templateContent,
        variables: updates.variables,
        is_active: updates.isActive
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.convertWhatsAppTemplate(data);
  }

  async deleteWhatsAppTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('whatsapp_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Analytics
  async getWebhookStats(companyId: string, days: number = 30): Promise<{
    totalEvents: number;
    eventsByType: Record<WebhookEventType, number>;
    eventsByStatus: Record<WebhookStatus, number>;
    leadsCreated: number;
    messagesSent: number;
    averageProcessingTime: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('webhook_events')
      .select('event_type, status, lead_id, created_at, processed_at')
      .eq('company_id', companyId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const events = data || [];
    const stats = {
      totalEvents: events.length,
      eventsByType: {} as Record<WebhookEventType, number>,
      eventsByStatus: {} as Record<WebhookStatus, number>,
      leadsCreated: events.filter(e => e.lead_id).length,
      messagesSent: 0,
      averageProcessingTime: 0
    };

    // Count by type
    events.forEach(event => {
      stats.eventsByType[event.event_type as WebhookEventType] = 
        (stats.eventsByType[event.event_type as WebhookEventType] || 0) + 1;
      stats.eventsByStatus[event.status as WebhookStatus] = 
        (stats.eventsByStatus[event.status as WebhookStatus] || 0) + 1;
    });

    // Calculate average processing time
    const processedEvents = events.filter(e => e.processed_at && e.created_at);
    if (processedEvents.length > 0) {
      const totalTime = processedEvents.reduce((sum, event) => {
        const start = new Date(event.created_at).getTime();
        const end = new Date(event.processed_at).getTime();
        return sum + (end - start);
      }, 0);
      stats.averageProcessingTime = totalTime / processedEvents.length / 1000; // seconds
    }

    // Get message count
    const { count } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', startDate.toISOString());

    stats.messagesSent = count || 0;

    return stats;
  }

  // Helper conversion methods (snake_case to camelCase)
  private convertWebhookConfig(data: any): WebhookConfig {
    return {
      id: data.id,
      companyId: data.company_id,
      endpointUrl: data.endpoint_url,
      secretKey: data.secret_key,
      isActive: data.is_active,
      eventsEnabled: data.events_enabled,
      retryCount: data.retry_count,
      timeoutSeconds: data.timeout_seconds,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private convertWebhookEvent(data: any): WebhookEvent {
    return {
      id: data.id,
      companyId: data.company_id,
      eventType: data.event_type,
      status: data.status,
      payload: data.payload,
      customerEmail: data.customer_email,
      customerPhone: data.customer_phone,
      customerName: data.customer_name,
      cartValue: data.cart_value,
      orderId: data.order_id,
      leadId: data.lead_id,
      errorMessage: data.error_message,
      retryAttempts: data.retry_attempts,
      processedAt: data.processed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private convertWhatsAppMessage(data: any): WhatsAppMessage {
    return {
      id: data.id,
      webhookEventId: data.webhook_event_id,
      companyId: data.company_id,
      leadId: data.lead_id,
      phoneNumber: data.phone_number,
      messageTemplate: data.message_template,
      messageContent: data.message_content,
      status: data.status,
      sentAt: data.sent_at,
      deliveredAt: data.delivered_at,
      errorMessage: data.error_message,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private convertWhatsAppTemplate(data: any): WhatsAppTemplate {
    return {
      id: data.id,
      companyId: data.company_id,
      eventType: data.event_type,
      templateName: data.template_name,
      templateContent: data.template_content,
      variables: data.variables,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const webhooksService = new WebhooksService();