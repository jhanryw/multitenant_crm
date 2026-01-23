'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Status = 'loading' | 'ready' | 'saving' | 'done' | 'error'

function parseParams() {
  // Supabase às vezes manda parâmetros no hash (#), às vezes na query (?)
  const qs = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace('#', ''))

  const access_token = qs.get('access_token') || hash.get('access_token')
  const refresh_token = qs.get('refresh_token') || hash.get('refresh_token')
  const type = qs.get('type') || hash.get('type')

  // Formato novo (PKCE) pode vir com code
  const code = qs.get('code') || hash.get('code')

  return { access_token, refresh_token, type, code }
}

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState<string>('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    ;(async () => {
      setStatus('loading')
      setMessage('Validando link de recuperação...')

      const { access_token, refresh_token, type, code } = parseParams()

      try {
        // 1) Se vier access/refresh token, seta sessão diretamente
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })
          if (error) throw error
          setStatus('ready')
          setMessage('')
          return
        }

        // 2) Se vier code (PKCE), troca code por sessão
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          setStatus('ready')
          setMessage('')
          return
        }

        // 3) Se já houver sessão (caso raro), libera
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          setStatus('ready')
          setMessage('')
          return
        }

        // 4) Sem tokens: provavelmente redirect/allowlist/config errada
        setStatus('error')
        setMessage(
          'Não consegui validar o link. Gere um novo link em “Esqueci minha senha”.'
        )
      } catch (err: any) {
        setStatus('error')
        setMessage(err?.message || 'Erro ao validar link.')
      }
    })()
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
    setMessage('Senha atualizada. Redirecionando...')
    setTimeout(() => {
      window.location.href = '/login'
    }, 1200)
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', fontFamily: 'system-ui' }}>
      <h1>Redefinir senha</h1>

      {status === 'loading' && <p>{message}</p>}

      {status === 'error' && (
        <>
          <p>{message}</p>
          <p style={{ opacity: 0.8 }}>
            Dica: gere o link novamente em <code>/auth/forgot-password</code>.
          </p>
        </>
      )}

      {status === 'ready' && (
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
        </>
      )}

      {status === 'done' && <p>{message}</p>}
    </div>
  )
}
