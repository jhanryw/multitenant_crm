'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { affiliateService, type Affiliate, type AffiliateCommission } from '@/services/affiliate.service';

interface AffiliateWithProfile extends Affiliate {
  user_profiles: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function AffiliateManagementSystemPage() {
  const router = useRouter()
  const [affiliates, setAffiliates] = useState<AffiliateWithProfile[]>([])
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAffiliate, setSelectedAffiliate] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [companyId, setCompanyId] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [showAffiliateModal, setShowAffiliateModal] = useState(false)
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [selectedCommission, setSelectedCommission] = useState<AffiliateCommission | null>(null)

  useEffect(() => {
    loadAffiliateData()
  }, [])

  async function loadAffiliateData() {
    try {
      setLoading(true)
      const supabase = createClient()

      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      // Get user profile to find company
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile?.company_id) {
        console.error('Failed to load user profile:', profileError)
        return
      }

      setCompanyId(profile.company_id)

      // Load affiliates for company
      const affiliatesData = await affiliateService.getCompanyAffiliates(profile.company_id)
      setAffiliates(affiliatesData || [])

      // Load recent commissions
      const commissionsData = await affiliateService.getCompanyCommissions(profile.company_id, {
        startDate: getDateRangeStart(dateRange)
      })
      setCommissions(commissionsData || [])

    } catch (error: any) {
      console.error('Error loading affiliate data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getDateRangeStart(range: '7d' | '30d' | '90d' | 'all'): string | undefined {
    if (range === 'all') return undefined
    
    const days = parseInt(range)
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString()
  }

  async function handleApproveAffiliate(affiliateId: string) {
    try {
      await affiliateService.approveAffiliate(affiliateId)
      await loadAffiliateData()
    } catch (error) {
      console.error('Error approving affiliate:', error)
    }
  }

  async function handleSuspendAffiliate(affiliateId: string) {
    const reason = window.prompt('Motivo da suspensão:')
    if (!reason) return

    try {
      await affiliateService.suspendAffiliate(affiliateId, reason)
      await loadAffiliateData()
    } catch (error) {
      console.error('Error suspending affiliate:', error)
    }
  }

  async function handleApproveCommission(commissionId: string) {
    try {
      await affiliateService.approveCommission(commissionId, userId)
      await loadAffiliateData()
    } catch (error) {
      console.error('Error approving commission:', error)
    }
  }

  async function handleRejectCommission(commissionId: string) {
    const reason = window.prompt('Motivo da rejeição:')
    if (!reason) return

    try {
      await affiliateService.rejectCommission(commissionId, reason)
      await loadAffiliateData()
    } catch (error) {
      console.error('Error rejecting commission:', error)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
      case 'approved':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'terminated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusLabel(status: string) {
    const labels: { [key: string]: string } = {
      pending: 'Pendente',
      active: 'Ativo',
      suspended: 'Suspenso',
      terminated: 'Encerrado',
      approved: 'Aprovado',
      paid: 'Pago',
      rejected: 'Rejeitado'
    }
    return labels[status] || status
  }

  const filteredAffiliates = affiliates?.filter(affiliate => {
    const matchesStatus = filterStatus === 'all' || affiliate.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      affiliate.affiliate_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.user_profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.user_profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.user_profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  }) || []

  const stats = {
    totalAffiliates: affiliates?.length || 0,
    activeAffiliates: affiliates?.filter(a => a.status === 'active').length || 0,
    pendingAffiliates: affiliates?.filter(a => a.status === 'pending').length || 0,
    totalCommissions: commissions?.length || 0,
    pendingCommissions: commissions?.filter(c => c.status === 'pending').length || 0,
    totalEarnings: commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0,
    pendingPayments: commissions?.filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sistema de Gestão de Afiliados
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gerencie afiliados, comissões e pagamentos com rastreamento completo de vendas
              </p>
            </div>
            <button
              onClick={() => setShowAffiliateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Afiliado
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Afiliados</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAffiliates}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {stats.activeAffiliates} ativos • {stats.pendingAffiliates} pendentes
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Comissões</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCommissions}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {stats.pendingCommissions} pendentes de aprovação
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gerado</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  R$ {stats.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Em comissões rastreadas
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagamentos Pendentes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  R$ {stats.pendingPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Aprovados, aguardando pagamento
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="active">Ativo</option>
                <option value="suspended">Suspenso</option>
                <option value="terminated">Encerrado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="all">Todo o período</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Código, nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Affiliates Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Afiliados Registrados ({filteredAffiliates.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Afiliado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Indicações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversões
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ganhos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAffiliates.map((affiliate) => (
                  <tr 
                    key={affiliate.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedAffiliate(affiliate.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {affiliate.user_profiles?.first_name?.charAt(0) || '?'}
                              {affiliate.user_profiles?.last_name?.charAt(0) || ''}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {affiliate.user_profiles?.first_name} {affiliate.user_profiles?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {affiliate.user_profiles?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{affiliate.affiliate_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{affiliate.total_referrals}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{affiliate.successful_conversions}</div>
                      <div className="text-xs text-gray-500">
                        {affiliate.total_referrals > 0 
                          ? `${((affiliate.successful_conversions / affiliate.total_referrals) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{affiliate.commission_rate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        R$ {Number(affiliate.total_earnings).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500">
                        Pago: R$ {Number(affiliate.paid_earnings).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(affiliate.status)}`}>
                        {getStatusLabel(affiliate.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {affiliate.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApproveAffiliate(affiliate.id)
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Aprovar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        {affiliate.status === 'active' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSuspendAffiliate(affiliate.id)
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Suspender"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedAffiliate(affiliate.id)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalhes"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAffiliates.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum afiliado encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filterStatus !== 'all' ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando seu primeiro afiliado'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}