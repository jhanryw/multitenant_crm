import { createClient } from '@/lib/supabase/client';

export interface LeadAutomation {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  trigger_type: 'time_based' | 'status_change' | 'stage_change' | 'tag_added' | 'inactivity';
  trigger_config: Record<string, any>;
  action_type: 'send_message' | 'change_status' | 'assign_seller' | 'add_tag' | 'notify_user';
  action_config: Record<string, any>;
  conditions: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateAutomationData {
  company_id: string;
  name: string;
  description?: string;
  trigger_type: 'time_based' | 'status_change' | 'stage_change' | 'tag_added' | 'inactivity';
  trigger_config: Record<string, any>;
  action_type: 'send_message' | 'change_status' | 'assign_seller' | 'add_tag' | 'notify_user';
  action_config: Record<string, any>;
  conditions?: Record<string, any>;
}

class AutomationsService {
  private supabase = createClient();

  async getAllAutomations(companyId: string): Promise<LeadAutomation[]> {
    const { data, error } = await this.supabase
      .from('lead_automations')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createAutomation(automationData: CreateAutomationData): Promise<LeadAutomation> {
    const { data, error } = await this.supabase
      .from('lead_automations')
      .insert([automationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAutomation(automationId: string, updates: Partial<LeadAutomation>): Promise<LeadAutomation> {
    const { data, error } = await this.supabase
      .from('lead_automations')
      .update(updates)
      .eq('id', automationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async toggleAutomation(automationId: string, isActive: boolean): Promise<LeadAutomation> {
    const { data, error } = await this.supabase
      .from('lead_automations')
      .update({ is_active: isActive })
      .eq('id', automationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAutomation(automationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('lead_automations')
      .delete()
      .eq('id', automationId);

    if (error) throw error;
  }

  async getAutomationLogs(automationId: string, limit: number = 50) {
    const { data, error } = await this.supabase
      .from('automation_logs')
      .select('*')
      .eq('automation_id', automationId)
      .order('executed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}

export const automationsService = new AutomationsService();