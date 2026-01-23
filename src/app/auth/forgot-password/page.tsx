'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

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

    // Por segurança, você pode SEMPRE mostrar “enviado” (mesmo se email não existir)
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
      <div className="w-full max-w-md rounded-2xl border bg-background p-8 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight">Esqueci minha senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        <div className="mt-8 space-y-3">
          <label className="text-sm font-medium">Email</label>
          <input
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
            type="email"
            placeholder="seuemail@dominio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'sending'}
          />

          <button
            className="w-full rounded-xl bg-primary px-4 py-3 text-primary-foreground font-medium disabled:opacity-60"
            onClick={handleSend}
            disabled={!email || status === 'sending'}
            type="button"
          >
            {status === 'sending' ? 'Enviando…' : 'Enviar link de redefinição'}
          </button>

          {msg ? (
            <p className={status === 'error' ? 'text-sm text-red-500' : 'text-sm text-muted-foreground'}>
              {msg}
            </p>
          ) : null}

          <div className="pt-2">
            <Link className="text-sm text-primary hover:text-primary/80" href="/login">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
