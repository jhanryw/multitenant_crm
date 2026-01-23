'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    // Quando o usuário abre o link do email, o Supabase dispara PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // fallback: algumas configs já chegam "logadas" e não disparam event
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleUpdatePassword() {
    setStatus('saving')
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setStatus('error')
      setMessage(error.message)
      return
    }

    setStatus('done')
    setMessage('Senha atualizada. Você já pode entrar no CRM.')
    // opcional: redirecionar depois
    // window.location.href = '/login'
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', fontFamily: 'system-ui' }}>
      <h1>Redefinir senha</h1>

      {!ready ? (
        <p>
          Abrindo o link de recuperação... Se esta tela não liberar em poucos segundos,
          gere um novo link de “Esqueci minha senha”.
        </p>
      ) : (
        <>
          <label>Nova senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 10, margin: '8px 0 12px' }}
            placeholder="Digite sua nova senha"
          />

          <button
            onClick={handleUpdatePassword}
            disabled={!password || status === 'saving'}
            style={{ width: '100%', padding: 10 }}
          >
            {status === 'saving' ? 'Salvando...' : 'Salvar nova senha'}
          </button>

          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </>
      )}
    </div>
  )
}
