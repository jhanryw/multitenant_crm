import { createClient } from '@/lib/supabase/client';

export interface WhatsAppWebSession {
  id: string;
  company_id: string;
  session_name: string;
  phone_number?: string;
  qr_code?: string;
  connection_status: 'disconnected' | 'qr_pending' | 'connected' | 'error';
  session_data: Record<string, any>;
  last_connected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionData {
  company_id: string;
  session_name: string;
}

class WhatsAppWebService {
  private supabase = createClient();

  async getAllSessions(companyId: string): Promise<WhatsAppWebSession[]> {
    const { data, error } = await this.supabase
      .from('whatsapp_web_sessions')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createSession(sessionData: CreateSessionData): Promise<WhatsAppWebSession> {
    const { data, error } = await this.supabase
      .from('whatsapp_web_sessions')
      .insert([{
        ...sessionData,
        connection_status: 'disconnected'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSessionQRCode(sessionId: string, qrCode: string): Promise<WhatsAppWebSession> {
    const { data, error } = await this.supabase
      .from('whatsapp_web_sessions')
      .update({
        qr_code: qrCode,
        connection_status: 'qr_pending'
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSessionStatus(
    sessionId: string,
    status: 'disconnected' | 'qr_pending' | 'connected' | 'error',
    phoneNumber?: string
  ): Promise<WhatsAppWebSession> {
    const updates: any = {
      connection_status: status
    };

    if (status === 'connected') {
      updates.last_connected_at = new Date().toISOString();
      if (phoneNumber) updates.phone_number = phoneNumber;
    }

    const { data, error } = await this.supabase
      .from('whatsapp_web_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('whatsapp_web_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  }

  async disconnectSession(sessionId: string): Promise<WhatsAppWebSession> {
    const { data, error } = await this.supabase
      .from('whatsapp_web_sessions')
      .update({
        connection_status: 'disconnected',
        qr_code: null
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const whatsAppWebService = new WhatsAppWebService();