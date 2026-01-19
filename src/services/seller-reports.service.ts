import { createClient } from '@/lib/supabase/client';

export interface SellerReport {
  metric_name: string;
  metric_value: number;
  comparison_period: number;
  percentage_change: number;
}

export interface RevenueByChannel {
  channel: string;
  revenue: number;
  lead_count: number;
}

class SellerReportsService {
  private supabase = createClient();

  async getDetailedSellerReport(
    sellerId: string,
    startDate: string,
    endDate: string
  ): Promise<SellerReport[]> {
    const { data, error } = await this.supabase
      .rpc('get_seller_detailed_report', {
        p_seller_id: sellerId,
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (error) throw error;
    return data || [];
  }

  async getRevenueByChannel(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<RevenueByChannel[]> {
    const { data, error } = await this.supabase
      .rpc('get_revenue_by_channel', {
        p_company_id: companyId,
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (error) throw error;
    return data || [];
  }

  async getSellerMetrics(sellerId: string, startDate: string, endDate: string) {
    const { data, error } = await this.supabase
      .from('seller_metrics')
      .select('*')
      .eq('seller_id', sellerId)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getOpenNegotiations(sellerId: string) {
    const { data, error } = await this.supabase
      .from('negotiations')
      .select('*, leads(*)')
      .eq('seller_id', sellerId)
      .eq('negotiation_status', 'open')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const sellerReportsService = new SellerReportsService();