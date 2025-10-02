'use client'
import { useState } from 'react'
import { supabaseClient } from '@/lib/supabase.client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabaseClient.auth.signInWithOtp({ email })
    if (!error) setSent(true)
    else alert(error.message)
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabaseClient.auth.verifyOtp({ email, token: code, type: 'email' })
    if (error) return alert(error.message)
    window.location.href = '/messages/new'
  }

  return (
    <div className="container py-10" style={{maxWidth: 480}}>
      <h1 className="title text-2xl font-semibold">Вход</h1>
      {!sent ? (
        <form onSubmit={sendCode} className="card mt-4 grid gap-3">
          <label className="text-sm">Email</label>
          <input className="border rounded-xl px-3 py-2" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn primary mt-2" type="submit">Получить код</button>
        </form>
      ) : (
        <form onSubmit={confirm} className="card mt-4 grid gap-3">
          <p className="text-sm text-[var(--mute)]">Мы отправили 6‑значный код на {email}.</p>
          <label className="text-sm">Код</label>
          <input className="border rounded-xl px-3 py-2" inputMode="numeric" pattern="[0-9]*" required value={code} onChange={e=>setCode(e.target.value)} />
          <button className="btn primary mt-2" type="submit">Войти</button>
        </form>
      )}
    </div>
  )
}
