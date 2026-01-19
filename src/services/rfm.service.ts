import { createClient } from '@/lib/supabase/client';

export interface RFMScore {
  id: string;
  lead_id: string;
  company_id: string;
  recency_score: number;
  frequency_score: number;
  monetary_score: number;
  rfm_segment: string;
  last_interaction_date?: string;
  interaction_count: number;
  total_value: number;
  calculated_at: string;
}

export interface RFMAnalysis {
  segment: string;
  count: number;
  total_value: number;
  avg_recency: number;
  avg_frequency: number;
  avg_monetary: number;
}

class RFMService {
  private supabase = createClient();

  async calculateRFMScores(companyId: string): Promise<void> {
    const { error } = await this.supabase
      .rpc('calculate_rfm_scores', { p_company_id: companyId });

    if (error) throw error;
  }

  async getRFMScores(companyId: string): Promise<RFMScore[]> {
    const { data, error } = await this.supabase
      .from('lead_rfm_scores')
      .select('*')
      .eq('company_id', companyId)
      .order('calculated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getRFMAnalysisBySegment(companyId: string): Promise<RFMAnalysis[]> {
    const { data, error } = await this.supabase
      .from('lead_rfm_scores')
      .select('rfm_segment, recency_score, frequency_score, monetary_score, total_value')
      .eq('company_id', companyId);

    if (error) throw error;

    const segmentMap = new Map<string, RFMAnalysis>();
    
    data?.forEach(score => {
      const segment = score.rfm_segment;
      if (!segmentMap.has(segment)) {
        segmentMap.set(segment, {
          segment,
          count: 0,
          total_value: 0,
          avg_recency: 0,
          avg_frequency: 0,
          avg_monetary: 0
        });
      }

      const analysis = segmentMap.get(segment)!;
      analysis.count += 1;
      analysis.total_value += score.total_value || 0;
      analysis.avg_recency += score.recency_score;
      analysis.avg_frequency += score.frequency_score;
      analysis.avg_monetary += score.monetary_score;
    });

    return Array.from(segmentMap.values()).map(analysis => ({
      ...analysis,
      avg_recency: analysis.avg_recency / analysis.count,
      avg_frequency: analysis.avg_frequency / analysis.count,
      avg_monetary: analysis.avg_monetary / analysis.count
    }));
  }

  async getLeadRFMScore(leadId: string): Promise<RFMScore | null> {
    const { data, error } = await this.supabase
      .from('lead_rfm_scores')
      .select('*')
      .eq('lead_id', leadId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
}

export const rfmService = new RFMService();