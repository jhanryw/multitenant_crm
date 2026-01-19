import { createClient } from '@/lib/supabase/client';

export interface Goal {
  id: string;
  company_id: string;
  seller_id?: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalData {
  company_id: string;
  seller_id?: string;
  title: string;
  description?: string;
  target_value: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
}

class GoalsService {
  private supabase = createClient();

  async getAllGoals(companyId: string): Promise<Goal[]> {
    const { data, error } = await this.supabase
      .from('goals')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getSellerGoals(companyId: string, sellerId: string): Promise<Goal[]> {
    const { data, error } = await this.supabase
      .from('goals')
      .select('*')
      .eq('company_id', companyId)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createGoal(goalData: CreateGoalData): Promise<Goal> {
    const { data, error } = await this.supabase
      .from('goals')
      .insert([goalData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateGoalProgress(goalId: string, currentValue: number): Promise<Goal> {
    const { data, error } = await this.supabase
      .from('goals')
      .update({ current_value: currentValue })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteGoal(goalId: string): Promise<void> {
    const { error } = await this.supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
  }
}

export const goalsService = new GoalsService();