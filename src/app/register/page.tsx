'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { subscriptionService, type SubscriptionPlan } from '@/services/subscription.service';
import { CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPlans()
  }, [])

  async function loadPlans() {
    try {
      const data = await subscriptionService.getSubscriptionPlans()
      setPlans(data)
      if (data.length > 0) {
        setSelectedPlan(data[0].id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handlePlanSelect(planId: string) {
    setSelectedPlan(planId)
  }

  function handleContinue() {
    if (selectedPlan) {
      router.push(`/register/company?plan=${selectedPlan}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-lg text-gray-600">
            Selecione o plano ideal para sua empresa e comece hoje mesmo
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 max-w-4xl mx-auto">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handlePlanSelect(plan.id)}
              className={`relative bg-white rounded-2xl shadow-lg p-8 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'ring-4 ring-blue-500 transform scale-105'
                  : 'hover:shadow-xl'
              }`}
            >
              {/* Selected Badge */}
              {selectedPlan === plan.id && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-8 h-8 text-blue-500" />
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    {subscriptionService.formatAmount(plan.price, plan.currency)}
                  </span>
                  <span className="text-gray-600 ml-2">/{plan.billing_period === 'monthly' ? 'mês' : 'ano'}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {plan.max_users && (
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">
                      Até {plan.max_users} usuários
                    </span>
                  </div>
                )}
                {plan.max_leads && (
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">
                      {plan.max_leads} leads por mês
                    </span>
                  </div>
                )}
                {plan.features?.crm && (
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">
                      CRM Completo
                    </span>
                  </div>
                )}
                {plan.features?.integrations && (
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">
                      Integrações {plan.features.integrations}
                    </span>
                  </div>
                )}
                {plan.features?.support && (
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">
                      Suporte {plan.features.support}
                    </span>
                  </div>
                )}
                {plan.features?.analytics && (
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">
                      Analytics Avançado
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedPlan}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar com Plano Selecionado
          </button>
        </div>

        {/* Trial Notice */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            🎉 <strong>14 dias de teste grátis</strong> em todos os planos
          </p>
        </div>
      </div>
    </div>
  )
}