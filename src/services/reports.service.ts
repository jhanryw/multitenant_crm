import { supabase } from '../lib/supabase/client';

// Database types (snake_case)
interface SLAAveragesRow {
  total_leads: number;
  on_time_leads: number;
  warning_leads: number;
  overdue_leads: number;
  average_response_time: number;
}

interface RevenueBySellerRow {
  seller_id: string;
  seller_name: string;
  total_revenue: number;
  lead_count: number;
}

interface RevenueByTagsRow {
  tag_id: string;
  tag_name: string;
  total_revenue: number;
  lead_count: number;
}

interface LeadActivityRow {
  new_leads: number;
  converted_leads: number;
  lost_leads: number;
  conversion_rate: number;
}

// Application types (camelCase)
export interface SLAAverages {
  totalLeads: number;
  onTimeLeads: number;
  warningLeads: number;
  overdueLeads: number;
  averageResponseTime: number;
}

export interface RevenueBySeller {
  sellerId: string;
  sellerName: string;
  totalRevenue: number;
  leadCount: number;
}

export interface RevenueByTags {
  tagId: string;
  tagName: string;
  totalRevenue: number;
  leadCount: number;
}

export interface LeadActivity {
  newLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  sellerId?: string;
  tagId?: string;
  sector?: string;
  source?: string;
}

export const reportsService = {
  async getSLAAverages(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<{ data: SLAAverages | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc('calculate_sla_averages', {
        p_company_id: companyId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;

      const row = data?.[0] as SLAAveragesRow;
      if (!row) {
        return {
          data: {
            totalLeads: 0,
            onTimeLeads: 0,
            warningLeads: 0,
            overdueLeads: 0,
            averageResponseTime: 0,
          },
          error: null,
        };
      }

      return {
        data: {
          totalLeads: row.total_leads,
          onTimeLeads: row.on_time_leads,
          warningLeads: row.warning_leads,
          overdueLeads: row.overdue_leads,
          averageResponseTime: row.average_response_time,
        },
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch SLA averages'),
      };
    }
  },

  async getRevenueBySeller(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<{ data: RevenueBySeller[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc('calculate_revenue_by_seller', {
        p_company_id: companyId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;

      const converted = (data as RevenueBySellerRow[] || []).map((row) => ({
        sellerId: row.seller_id,
        sellerName: row.seller_name,
        totalRevenue: row.total_revenue,
        leadCount: row.lead_count,
      }));

      return { data: converted, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch revenue by seller'),
      };
    }
  },

  async getRevenueByTags(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<{ data: RevenueByTags[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc('calculate_revenue_by_tags', {
        p_company_id: companyId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;

      const converted = (data as RevenueByTagsRow[] || []).map((row) => ({
        tagId: row.tag_id,
        tagName: row.tag_name,
        totalRevenue: row.total_revenue,
        leadCount: row.lead_count,
      }));

      return { data: converted, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch revenue by tags'),
      };
    }
  },

  async getOpenNegotiationsValue(companyId: string): Promise<{ data: number | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc('get_open_negotiations_value', {
        p_company_id: companyId,
      });

      if (error) throw error;

      return { data: data as number, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch open negotiations value'),
      };
    }
  },

  async getLeadActivity(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<{ data: LeadActivity | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc('get_period_lead_activity', {
        p_company_id: companyId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;

      const row = data?.[0] as LeadActivityRow;
      if (!row) {
        return {
          data: {
            newLeads: 0,
            convertedLeads: 0,
            lostLeads: 0,
            conversionRate: 0,
          },
          error: null,
        };
      }

      return {
        data: {
          newLeads: row.new_leads,
          convertedLeads: row.converted_leads,
          lostLeads: row.lost_leads,
          conversionRate: row.conversion_rate,
        },
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch lead activity'),
      };
    }
  },

  async exportToExcel(companyId: string, filters: ReportFilters): Promise<{ error: Error | null }> {
    try {
      // In a real implementation, this would generate an Excel file
      // For now, we'll just log the request
      console.log('Export to Excel requested:', { companyId, filters });
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Failed to export to Excel'),
      };
    }
  },

  async exportToPDF(companyId: string, filters: ReportFilters): Promise<{ error: Error | null }> {
    try {
      // In a real implementation, this would generate a PDF file
      // For now, we'll just log the request
      console.log('Export to PDF requested:', { companyId, filters });
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Failed to export to PDF'),
      };
    }
  },
};