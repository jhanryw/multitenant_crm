'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import Icon from '@/components/ui/AppIcon'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function handleSend() {
    setStatus('sending')
    setMsg('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setStatus('error')
      setMsg(error.message)
      return
    }

    setStatus('sent')
    setMsg('Se esse e-mail estiver cadastrado, você receberá um link de redefinição em instantes.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto p-8 bg-card rounded-lg border border-border shadow-warm-lg">
        {/* Header (igual ao LoginForm) */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
            >
              <path
                d="M20 8L8 14V26L20 32L32 26V14L20 8Z"
                fill="white"
                fillOpacity="0.9"
              />
              <path
                d="M20 8V20M20 20L8 14M20 20L32 14M20 20V32"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-heading font-semibold text-foreground mb-2">
            Redefinir senha
          </h1>
          <p className="text-sm font-caption text-muted-foreground">
            Informe seu e-mail para receber o link de redefinição.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Feedback */}
          {msg && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 ${
                status === 'error'
                  ? 'bg-error/10 border border-error/20'
                  : 'bg-muted/40 border border-border'
              }`}
            >
              <Icon
                name={status === 'error' ? 'ExclamationCircleIcon' : 'InformationCircleIcon'}
                size={20}
                className={status === 'error' ? 'text-error flex-shrink-0 mt-0.5' : 'text-muted-foreground flex-shrink-0 mt-0.5'}
              />
              <p className={`text-sm ${status === 'error' ? 'text-error' : 'text-muted-foreground'}`}>
                {msg}
              </p>
            </div>
          )}

          {/* Email Field (igual ao LoginForm) */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              E-mail
            </label>
            <div className="relative">
              <Icon
                name="EnvelopeIcon"
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-background border rounded-lg text-sm font-caption text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-smooth border-input"
                placeholder="seu@email.com"
                disabled={status === 'sending'}
              />
            </div>
          </div>

          {/* Submit Button (igual ao LoginForm) */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!email || status === 'sending'}
            className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium text-sm font-caption hover:opacity-90 transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'sending' ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                Enviar link
                <Icon name="ArrowRightIcon" size={18} />
              </>
            )}
          </button>

          {/* Back to login */}
          <div className="pt-2">
            <Link className="text-sm font-caption text-primary hover:text-primary/80 transition-smooth" href="/login">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
