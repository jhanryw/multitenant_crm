'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function handleSend() {
    setErrorMsg('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setErrorMsg(error.message)
      return
    }

    setSent(true)
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', fontFamily: 'system-ui' }}>
      <h1>Esqueci minha senha</h1>

      {sent ? (
        <p>Email enviado. Verifique sua caixa de entrada.</p>
      ) : (
        <>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, margin: '8px 0 12px' }}
            placeholder="seuemail@dominio.com"
          />

          <button onClick={handleSend} disabled={!email} style={{ width: '100%', padding: 10 }}>
            Enviar link de redefinição
          </button>

          {errorMsg && <p style={{ marginTop: 12 }}>{errorMsg}</p>}
        </>
      )}
    </div>
  )
}
