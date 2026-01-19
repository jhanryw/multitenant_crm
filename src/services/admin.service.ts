import { supabase } from '../lib/supabase/client';

// Types for admin service
interface CompanyWithSubscription {
  companyId: string;
  companyName: string;
  companyEmail: string | null;
  subscriptionStatus: string | null;
  subscriptionPlan: string | null;
  subscriptionAmount: number | null;
  isActive: boolean | null;
  createdAt: string;
  lastPaymentDate: string | null;
}

interface SubscriptionStats {
  totalCompanies: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  inactiveSubscriptions: number;
  totalMrr: number;
}

interface DashboardMetrics {
  stats: SubscriptionStats | null;
  companies: CompanyWithSubscription[];
  recentTransactions: PaymentTransaction[];
}

interface PaymentTransaction {
  id: string;
  companyId: string;
  amount: number;
  currency: string;
  status: string;
  transactionType: string;
  createdAt: string;
  companyName?: string;
}

interface CompanyUpdateData {
  isActive?: boolean;
  subscriptionStatus?: string;
}

export const adminService = {
  // Get dashboard metrics and statistics
  async getDashboardMetrics(): Promise<{ data: DashboardMetrics | null; error: Error | null }> {
    try {
      // Get subscription statistics
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_subscription_stats')
        .single();

      if (statsError) throw statsError;

      // Get all companies with subscription details
      const { data: companiesData, error: companiesError } = await supabase
        .rpc('get_company_details_with_subscriptions');

      if (companiesError) throw companiesError;

      // Get recent payment transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('payment_transactions')
        .select(`
          id,
          company_id,
          amount,
          currency,
          status,
          transaction_type,
          created_at,
          companies (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;

      // Transform data to match interface
      const stats: SubscriptionStats = {
        totalCompanies: Number(statsData?.total_companies) || 0,
        activeSubscriptions: Number(statsData?.active_subscriptions) || 0,
        trialSubscriptions: Number(statsData?.trial_subscriptions) || 0,
        inactiveSubscriptions: Number(statsData?.inactive_subscriptions) || 0,
        totalMrr: Number(statsData?.total_mrr) || 0,
      };

      const companies: CompanyWithSubscription[] = (companiesData || [])?.map((c: any) => ({
        companyId: c?.company_id,
        companyName: c?.company_name,
        companyEmail: c?.company_email,
        subscriptionStatus: c?.subscription_status,
        subscriptionPlan: c?.subscription_plan,
        subscriptionAmount: c?.subscription_amount,
        isActive: c?.is_active,
        createdAt: c?.created_at,
        lastPaymentDate: c?.last_payment_date,
      }));

      const recentTransactions: PaymentTransaction[] = (transactionsData || [])?.map((t: any) => ({
        id: t?.id,
        companyId: t?.company_id,
        amount: t?.amount,
        currency: t?.currency,
        status: t?.status,
        transactionType: t?.transaction_type,
        createdAt: t?.created_at,
        companyName: t?.companies?.name,
      }));

      return {
        data: {
          stats,
          companies,
          recentTransactions,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  },

  // Get all companies with filters
  async getCompanies(filters?: {
    status?: string;
    searchTerm?: string;
  }): Promise<{ data: CompanyWithSubscription[] | null; error: Error | null }> {
    try {
      let query = supabase.rpc('get_company_details_with_subscriptions');

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Apply client-side filtering
      if (filters?.status && filters.status !== 'all') {
        filteredData = filteredData?.filter(
          (c: any) => c?.subscription_status === filters.status
        );
      }

      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm?.toLowerCase();
        filteredData = filteredData?.filter(
          (c: any) =>
            c?.company_name?.toLowerCase()?.includes(searchLower) ||
            c?.company_email?.toLowerCase()?.includes(searchLower)
        );
      }

      const companies: CompanyWithSubscription[] = filteredData?.map((c: any) => ({
        companyId: c?.company_id,
        companyName: c?.company_name,
        companyEmail: c?.company_email,
        subscriptionStatus: c?.subscription_status,
        subscriptionPlan: c?.subscription_plan,
        subscriptionAmount: c?.subscription_amount,
        isActive: c?.is_active,
        createdAt: c?.created_at,
        lastPaymentDate: c?.last_payment_date,
      }));

      return { data: companies, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Update company status
  async updateCompanyStatus(
    companyId: string,
    updates: CompanyUpdateData
  ): Promise<{ data: any; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Get payment transactions for a company
  async getCompanyTransactions(
    companyId: string
  ): Promise<{ data: PaymentTransaction[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transactions: PaymentTransaction[] = (data || [])?.map((t: any) => ({
        id: t?.id,
        companyId: t?.company_id,
        amount: t?.amount,
        currency: t?.currency,
        status: t?.status,
        transactionType: t?.transaction_type,
        createdAt: t?.created_at,
      }));

      return { data: transactions, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Block/unblock company
  async toggleCompanyAccess(
    companyId: string,
    isActive: boolean
  ): Promise<{ data: any; error: Error | null }> {
    return this.updateCompanyStatus(companyId, { isActive });
  },

  // Update subscription status
  async updateSubscriptionStatus(
    companyId: string,
    status: string
  ): Promise<{ data: any; error: Error | null }> {
    return this.updateCompanyStatus(companyId, { subscriptionStatus: status });
  },
};