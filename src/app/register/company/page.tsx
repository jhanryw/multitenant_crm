'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { subscriptionService, type SubscriptionPlan } from '@/services/subscription.service';
import { Building2, User, MapPin, CreditCard } from 'lucide-react';

function CompanyRegistrationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan')

  const [step, setStep] = useState(1)
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [companyData, setCompanyData] = useState({
    companyName: '',
    legalName: '',
    documentNumber: '',
    email: '',
    phone: '',
    industry: '',
    size: 'small',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'BR'
    }
  })

  const [ownerData, setOwnerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!planId) {
      router.push('/register')
      return
    }
    loadPlan()
  }, [planId, router])

  async function loadPlan() {
    if (!planId) return

    try {
      const plans = await subscriptionService.getSubscriptionPlans()
      const selectedPlan = plans.find(p => p.id === planId)
      if (selectedPlan) {
        setPlan(selectedPlan)
      } else {
        router.push('/register')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  function handleCompanyChange(field: string, value: string) {
    setCompanyData(prev => ({ ...prev, [field]: value }))
  }

  function handleAddressChange(field: string, value: string) {
    setCompanyData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }))
  }

  function handleOwnerChange(field: string, value: string) {
    setOwnerData(prev => ({ ...prev, [field]: value }))
  }

  function validateStep1() {
    if (!companyData.companyName || !companyData.legalName) {
      setError('Nome da empresa e razão social são obrigatórios')
      return false
    }

    if (!companyData.documentNumber || !subscriptionService.validateCNPJ(companyData.documentNumber)) {
      setError('CNPJ inválido')
      return false
    }

    if (!companyData.email || !/\S+@\S+\.\S+/.test(companyData.email)) {
      setError('Email inválido')
      return false
    }

    if (!companyData.phone || !subscriptionService.validatePhone(companyData.phone)) {
      setError('Telefone inválido')
      return false
    }

    return true
  }

  function validateStep2() {
    if (!companyData.address.street || !companyData.address.number) {
      setError('Endereço completo é obrigatório')
      return false
    }

    if (!companyData.address.city || !companyData.address.state || !companyData.address.postal_code) {
      setError('Cidade, estado e CEP são obrigatórios')
      return false
    }

    return true
  }

  function validateStep3() {
    if (!ownerData.firstName || !ownerData.lastName) {
      setError('Nome completo é obrigatório')
      return false
    }

    if (!ownerData.email || !/\S+@\S+\.\S+/.test(ownerData.email)) {
      setError('Email inválido')
      return false
    }

    if (!ownerData.password || ownerData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return false
    }

    if (ownerData.password !== ownerData.confirmPassword) {
      setError('Senhas não conferem')
      return false
    }

    return true
  }

  function handleNext() {
    setError('')

    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 3 && !validateStep3()) return

    if (step < 4) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1)
      setError('')
    }
  }

  async function handleSubmit() {
    if (!plan) return

    setLoading(true)
    setError('')

    try {
      router.push(`/register/payment?plan=${planId}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro da Empresa
          </h1>
          <p className="text-gray-600">
            Plano selecionado: <strong>{plan.name}</strong> - {subscriptionService.formatAmount(plan.price, plan.currency)}/{plan.billing_period === 'monthly' ? 'mês' : 'ano'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {num}
                </div>
                {num < 4 && (
                  <div
                    className={`w-16 h-1 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center mt-2 text-sm text-gray-600">
            <span className="text-center">
              {step === 1 && 'Dados da Empresa'}
              {step === 2 && 'Endereço'}
              {step === 3 && 'Dados do Responsável'}
              {step === 4 && 'Revisão'}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Company Data */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <Building2 className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Dados da Empresa</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Fantasia *
                </label>
                <input
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) => handleCompanyChange('companyName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome da sua empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razão Social *
                </label>
                <input
                  type="text"
                  value={companyData.legalName}
                  onChange={(e) => handleCompanyChange('legalName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Razão social completa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ *
                </label>
                <input
                  type="text"
                  value={companyData.documentNumber}
                  onChange={(e) => handleCompanyChange('documentNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={companyData.email}
                    onChange={(e) => handleCompanyChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={companyData.phone}
                    onChange={(e) => handleCompanyChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setor
                  </label>
                  <select
                    value={companyData.industry}
                    onChange={(e) => handleCompanyChange('industry', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="technology">Tecnologia</option>
                    <option value="retail">Varejo</option>
                    <option value="services">Serviços</option>
                    <option value="manufacturing">Indústria</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porte da Empresa
                  </label>
                  <select
                    value={companyData.size}
                    onChange={(e) => handleCompanyChange('size', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="small">Pequena (1-50)</option>
                    <option value="medium">Média (51-200)</option>
                    <option value="large">Grande (201-1000)</option>
                    <option value="enterprise">Enterprise (1000+)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Endereço</h2>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rua/Avenida *
                  </label>
                  <input
                    type="text"
                    value={companyData.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número *
                  </label>
                  <input
                    type="text"
                    value={companyData.address.number}
                    onChange={(e) => handleAddressChange('number', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={companyData.address.complement}
                    onChange={(e) => handleAddressChange('complement', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    value={companyData.address.neighborhood}
                    onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={companyData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <input
                    type="text"
                    value={companyData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    value={companyData.address.postal_code}
                    onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Owner Data */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <User className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Dados do Responsável</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={ownerData.firstName}
                    onChange={(e) => handleOwnerChange('firstName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sobrenome *
                  </label>
                  <input
                    type="text"
                    value={ownerData.lastName}
                    onChange={(e) => handleOwnerChange('lastName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={ownerData.email}
                    onChange={(e) => handleOwnerChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={ownerData.phone}
                    onChange={(e) => handleOwnerChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={ownerData.password}
                    onChange={(e) => handleOwnerChange('password', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    value={ownerData.confirmPassword}
                    onChange={(e) => handleOwnerChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Revisão dos Dados</h2>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Empresa</h3>
                  <p className="text-gray-700">{companyData.companyName}</p>
                  <p className="text-gray-600 text-sm">
                    {subscriptionService.formatCNPJ(companyData.documentNumber)}
                  </p>
                  <p className="text-gray-600 text-sm">{companyData.email}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Endereço</h3>
                  <p className="text-gray-700">
                    {companyData.address.street}, {companyData.address.number}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {companyData.address.neighborhood} - {companyData.address.city}/{companyData.address.state}
                  </p>
                  <p className="text-gray-600 text-sm">{companyData.address.postal_code}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Responsável</h3>
                  <p className="text-gray-700">
                    {ownerData.firstName} {ownerData.lastName}
                  </p>
                  <p className="text-gray-600 text-sm">{ownerData.email}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Plano</h3>
                  <p className="text-gray-700">{plan.name}</p>
                  <p className="text-gray-600 text-sm">
                    {subscriptionService.formatAmount(plan.price, plan.currency)}/{plan.billing_period === 'monthly' ? 'mês' : 'ano'}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ Ao clicar em "Prosseguir para Pagamento", você será redirecionado para a página de pagamento seguro.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1 || loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Voltar
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  {step < 4 ? 'Próximo' : 'Prosseguir para Pagamento'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CompanyRegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    }>
      <CompanyRegistrationForm />
    </Suspense>
  )
}