import { createClient } from '@/lib/supabase/client';

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  billing_period: string
  features: any
  max_users?: number
  max_leads?: number
}

export interface CompanyRegistrationData {
  companyName: string
  legalName: string
  documentNumber: string
  email: string
  phone: string
  industry?: string
  size?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

export interface OwnerData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
}

export const subscriptionService = {
  /**
   * Get all active subscription plans
   */
  async getSubscriptionPlans() {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (error) {
      throw new Error(error.message || 'Failed to fetch subscription plans')
    }

    return data as SubscriptionPlan[]
  },

  /**
   * Create subscription payment intent via Supabase Edge Function
   */
  async createSubscriptionPayment(
    planId: string,
    companyData: CompanyRegistrationData,
    ownerData: OwnerData
  ) {
    const supabase = createClient()

    const { data, error } = await supabase.functions.invoke('create-subscription-payment', {
      body: {
        planId,
        companyData,
        ownerData
      }
    })

    if (error) {
      throw new Error(error.message || 'Failed to create subscription payment')
    }

    return data
  },

  /**
   * Confirm subscription payment
   */
  async confirmSubscriptionPayment(paymentIntentId: string) {
    const supabase = createClient()

    const { data, error } = await supabase.functions.invoke('confirm-subscription', {
      body: { paymentIntentId }
    })

    if (error) {
      throw new Error(error.message || 'Failed to confirm subscription payment')
    }

    return data
  },

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  },

  /**
   * Validate Brazilian CNPJ
   */
  validateCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]/g, '')

    if (cnpj.length !== 14) return false

    // Check for known invalid CNPJs
    if (/^(\d)\1+$/.test(cnpj)) return false

    // Validation algorithm
    let size = cnpj.length - 2
    let numbers = cnpj.substring(0, size)
    const digits = cnpj.substring(size)
    let sum = 0
    let pos = size - 7

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--
      if (pos < 2) pos = 9
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (result !== parseInt(digits.charAt(0))) return false

    size = size + 1
    numbers = cnpj.substring(0, size)
    sum = 0
    pos = size - 7

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--
      if (pos < 2) pos = 9
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (result !== parseInt(digits.charAt(1))) return false

    return true
  },

  /**
   * Format CNPJ for display
   */
  formatCNPJ(cnpj: string): string {
    cnpj = cnpj.replace(/[^\d]/g, '')
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  },

  /**
   * Validate Brazilian phone number
   */
  validatePhone(phone: string): boolean {
    phone = phone.replace(/[^\d]/g, '')
    return phone.length >= 10 && phone.length <= 11
  },

  /**
   * Format phone for display
   */
  formatPhone(phone: string): string {
    phone = phone.replace(/[^\d]/g, '')
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return phone
  }
}