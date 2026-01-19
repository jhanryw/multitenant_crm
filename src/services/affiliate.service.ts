import { createClient } from '@/lib/supabase/client';

export interface Affiliate {
  id: string
  user_id: string
  company_id: string
  affiliate_code: string
  status: 'pending' | 'active' | 'suspended' | 'terminated'
  commission_rate: number
  total_referrals: number
  successful_conversions: number
  total_earnings: number
  pending_earnings: number
  paid_earnings: number
  payment_method?: string
  payment_details?: any
  notes?: string
  approved_at?: string
  suspended_at?: string
  created_at: string
  updated_at: string
}

export interface ReferralLink {
  id: string
  affiliate_id: string
  referral_code: string
  campaign_name?: string
  target_url?: string
  clicks_count: number
  conversions_count: number
  conversion_rate: number
  status: 'active' | 'converted' | 'expired' | 'invalid'
  expires_at?: string
  created_at: string
}

export interface AffiliateCommission {
  id: string
  affiliate_id: string
  company_id: string
  subscription_id?: string
  payment_transaction_id?: string
  referral_link_id?: string
  commission_amount: number
  commission_rate: number
  base_amount: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  currency: string
  approved_by?: string
  approved_at?: string
  paid_at?: string
  rejection_reason?: string
  notes?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface AffiliatePayout {
  id: string
  affiliate_id: string
  amount: number
  currency: string
  payment_method: string
  payment_reference?: string
  commission_ids: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  processed_at?: string
  created_at: string
}

export const affiliateService = {
  /**
   * Get all affiliates for company (admin only)
   */
  async getCompanyAffiliates(companyId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('affiliates')
      .select(`
        *,
        user_profiles!inner(first_name, last_name, email)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as (Affiliate & { user_profiles: any })[]
  },

  /**
   * Get affiliate by ID
   */
  async getAffiliate(affiliateId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('affiliates')
      .select(`
        *,
        user_profiles!inner(first_name, last_name, email, phone)
      `)
      .eq('id', affiliateId)
      .single()
    
    if (error) throw error
    return data as Affiliate & { user_profiles: any }
  },

  /**
   * Create new affiliate
   */
  async createAffiliate(affiliateData: {
    user_id: string
    company_id: string
    commission_rate?: number
    payment_method?: string
    payment_details?: any
    notes?: string
  }) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('affiliates')
      .insert(affiliateData)
      .select()
      .single()
    
    if (error) throw error
    return data as Affiliate
  },

  /**
   * Update affiliate
   */
  async updateAffiliate(affiliateId: string, updates: Partial<Affiliate>) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('affiliates')
      .update(updates)
      .eq('id', affiliateId)
      .select()
      .single()
    
    if (error) throw error
    return data as Affiliate
  },

  /**
   * Approve affiliate
   */
  async approveAffiliate(affiliateId: string) {
    return this.updateAffiliate(affiliateId, {
      status: 'active',
      approved_at: new Date().toISOString()
    })
  },

  /**
   * Suspend affiliate
   */
  async suspendAffiliate(affiliateId: string, reason?: string) {
    return this.updateAffiliate(affiliateId, {
      status: 'suspended',
      suspended_at: new Date().toISOString(),
      notes: reason
    })
  },

  /**
   * Get affiliate referral links
   */
  async getReferralLinks(affiliateId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('referral_links')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as ReferralLink[]
  },

  /**
   * Create referral link
   */
  async createReferralLink(linkData: {
    affiliate_id: string
    campaign_name?: string
    target_url?: string
    expires_at?: string
  }) {
    const supabase = createClient()
    
    // Generate unique referral code
    const referralCode = `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    
    const { data, error } = await supabase
      .from('referral_links')
      .insert({
        ...linkData,
        referral_code: referralCode
      })
      .select()
      .single()
    
    if (error) throw error
    return data as ReferralLink
  },

  /**
   * Get affiliate commissions
   */
  async getAffiliateCommissions(
    affiliateId: string,
    filters?: {
      status?: string
      startDate?: string
      endDate?: string
    }
  ) {
    const supabase = createClient()
    
    let query = supabase
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false })
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data as AffiliateCommission[]
  },

  /**
   * Get company commissions (admin only)
   */
  async getCompanyCommissions(
    companyId: string,
    filters?: {
      status?: string
      affiliateId?: string
      startDate?: string
      endDate?: string
    }
  ) {
    const supabase = createClient()
    
    let query = supabase
      .from('affiliate_commissions')
      .select(`
        *,
        affiliates!inner(affiliate_code, user_profiles!inner(first_name, last_name, email))
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.affiliateId) {
      query = query.eq('affiliate_id', filters.affiliateId)
    }
    
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data as (AffiliateCommission & { affiliates: any })[]
  },

  /**
   * Approve commission
   */
  async approveCommission(commissionId: string, approvedBy: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('affiliate_commissions')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', commissionId)
      .select()
      .single()
    
    if (error) throw error
    return data as AffiliateCommission
  },

  /**
   * Reject commission
   */
  async rejectCommission(commissionId: string, reason: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('affiliate_commissions')
      .update({
        status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', commissionId)
      .select()
      .single()
    
    if (error) throw error
    return data as AffiliateCommission
  },

  /**
   * Process payout
   */
  async processAffiliatePayment(
    affiliateId: string,
    commissionIds: string[],
    paymentData: {
      amount: number
      currency: string
      payment_method: string
      payment_reference?: string
    }
  ) {
    const supabase = createClient()
    
    // Create payout record
    const { data: payout, error: payoutError } = await supabase
      .from('affiliate_payouts')
      .insert({
        affiliate_id: affiliateId,
        ...paymentData,
        commission_ids: commissionIds,
        status: 'processing',
        processed_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (payoutError) throw payoutError
    
    // Update commissions to paid status
    const { error: updateError } = await supabase
      .from('affiliate_commissions')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .in('id', commissionIds)
    
    if (updateError) throw updateError
    
    return payout as AffiliatePayout
  },

  /**
   * Get affiliate performance stats
   */
  async getAffiliateStats(affiliateId: string, period: '7d' | '30d' | '90d' | 'all' = '30d') {
    const supabase = createClient()
    
    let dateFilter: string | null = null
    
    if (period !== 'all') {
      const days = parseInt(period)
      const date = new Date()
      date.setDate(date.getDate() - days)
      dateFilter = date.toISOString()
    }
    
    // Get commissions
    let commissionsQuery = supabase
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', affiliateId)
    
    if (dateFilter) {
      commissionsQuery = commissionsQuery.gte('created_at', dateFilter)
    }
    
    const { data: commissions } = await commissionsQuery
    
    // Calculate stats
    const totalCommissions = commissions?.length || 0
    const totalEarnings = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0
    const pendingCommissions = commissions?.filter(c => c.status === 'pending').length || 0
    const approvedCommissions = commissions?.filter(c => c.status === 'approved').length || 0
    const paidCommissions = commissions?.filter(c => c.status === 'paid').length || 0
    
    return {
      totalCommissions,
      totalEarnings,
      pendingCommissions,
      approvedCommissions,
      paidCommissions,
      averageCommission: totalCommissions > 0 ? totalEarnings / totalCommissions : 0
    }
  },

  /**
   * Generate affiliate payment link with referral code
   */
  generatePaymentLink(referralCode: string, productUrl: string) {
    const url = new URL(productUrl)
    url.searchParams.set('ref', referralCode)
    return url.toString()
  },

  /**
   * Track referral link click
   */
  async trackReferralClick(referralCode: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('referral_links')
      .update({ 
        clicks_count: supabase.rpc('increment', { field: 'clicks_count' })
      })
      .eq('referral_code', referralCode)
    
    if (error) {
      console.error('Error tracking referral click:', error)
    }
  }
}