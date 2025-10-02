'use client'
import { useState } from 'react'
import { supabaseClient } from '@/lib/supabase.client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabaseClient.auth.signInWithOtp({ email })
    setBusy(false)
    if (!error) setSent(true)
    else alert(error.message)
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const { data, error } = await supabaseClient.auth.verifyOtp({
      email,
      token: code,
      type: 'email'
    })
    if (error) {
      setBusy(false)
      return alert(error.message)
    }

    // ВАЖНО: после клиентской авторизации сообщаем серверу, чтобы он поставил куки
    const session = data.session
    if (session?.access_token && session?.refresh_token) {
      try {
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token
          }),
          credentials: 'include'
        })
      } catch {}
    }

    // Идём на защищённую страницу — теперь SSR увидит сессию в куках
    window.location.href = '/messages/new'
  }

  return (
    <div className="container py-10" style={{ maxWidth: 480 }}>
      <h1 className="title text-2xl font-semibold">Вход</h1>

      {!sent ? (
        <form onSubmit={sendCode} className="card mt-4 grid gap-3">
          <label className="text-sm">Email</label>
          <input
            className="border rounded-xl px-3 py-2"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <button className="btn primary mt-2" type="submit" disabled={busy}>
            {busy ? 'Отправляем…' : 'Получить код'}
          </button>
        </form>
      ) : (
        <form onSubmit={confirm} className="card mt-4 grid gap-3">
          <p className="text-sm text-[var(--mute)]">
            Мы отправили 6-значный код на {email}.
          </p>
          <label className="text-sm">Код</label>
          <input
            className="border rounded-xl px-3 py-2"
            inputMode="numeric"
            pattern="[0-9]*"
            minLength={6}
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="one-time-code"
            placeholder="••••••"
          />
          <button className="btn primary mt-2" type="submit" disabled={busy}>
            {busy ? 'Входим…' : 'Войти'}
          </button>
        </form>
      )}
    </div>
  )
}
