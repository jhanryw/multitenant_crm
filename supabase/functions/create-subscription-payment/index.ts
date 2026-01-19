import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-11-20.acacia',
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { planId, companyData, ownerData } = await req.json()

    // Validate required data
    if (!planId || !companyData || !ownerData) {
      return new Response(
        JSON.stringify({ error: 'Missing required data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get subscription plan
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Subscription plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user account
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: ownerData.email,
      password: ownerData.password,
      email_confirm: true,
      user_metadata: {
        first_name: ownerData.firstName,
        last_name: ownerData.lastName,
        phone: ownerData.phone
      }
    })

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email: ownerData.email,
      name: `${ownerData.firstName} ${ownerData.lastName}`,
      phone: ownerData.phone,
      metadata: {
        supabase_user_id: authData.user.id,
        company_name: companyData.companyName,
        document_number: companyData.documentNumber
      }
    })

    // Create user profile
    await supabaseClient
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        first_name: ownerData.firstName,
        last_name: ownerData.lastName,
        email: ownerData.email,
        phone: ownerData.phone,
        role: 'owner',
        stripe_customer_id: stripeCustomer.id
      })

    // Create company
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .insert({
        owner_id: authData.user.id,
        name: companyData.companyName,
        legal_name: companyData.legalName,
        document_number: companyData.documentNumber,
        email: companyData.email,
        phone: companyData.phone,
        industry: companyData.industry,
        size: companyData.size,
        address: companyData.address,
        subscription_status: 'trial'
      })
      .select()
      .single()

    if (companyError || !company) {
      return new Response(
        JSON.stringify({ error: 'Failed to create company' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Link user to company
    await supabaseClient
      .from('user_profiles')
      .update({ company_id: company.id })
      .eq('id', authData.user.id)

    // Calculate amount in cents (Stripe uses cents)
    const amountInCents = Math.round(plan.price * 100)

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: plan.currency.toLowerCase(),
      customer: stripeCustomer.id,
      description: `${plan.name} - ${companyData.companyName}`,
      metadata: {
        plan_id: planId,
        company_id: company.id,
        user_id: authData.user.id,
        plan_name: plan.name
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Create subscription record
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .insert({
        company_id: company.id,
        plan_id: planId,
        payment_intent_id: paymentIntent.id,
        stripe_customer_id: stripeCustomer.id,
        amount: plan.price,
        currency: plan.currency,
        billing_period: plan.billing_period,
        status: 'pending',
        payment_status: 'pending',
        trial_start: new Date().toISOString(),
        trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    if (subscriptionError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create payment transaction
    await supabaseClient.from('payment_transactions').insert({
      subscription_id: subscription.id,
      company_id: company.id,
      payment_intent_id: paymentIntent.id,
      amount: plan.price,
      currency: plan.currency,
      status: 'pending',
      transaction_type: 'subscription',
      gateway: 'stripe'
    })

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        companyId: company.id,
        subscriptionId: subscription.id,
        userId: authData.user.id,
        amount: amountInCents,
        currency: paymentIntent.currency
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Subscription payment creation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})