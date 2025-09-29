'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

type Step = 'email' | 'code'

function invalidEmail(e: string) {
  return !e || !/\S+@\S+\.\S+/.test(e)
}
function parseCooldownSeconds(msg?: string, fallback = 60) {
  if (!msg) return fallback
  const m = /через\s+(\d+)\s*сек/i.exec(msg)
  return m ? Math.max(1, parseInt(m[1], 10)) : fallback
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<Step>('email')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Куда редиректить после успешного входа (только внутренние пути)
  const nextUrl = useMemo(() => {
    try {
      const sp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
      const n = sp.get('next')
      return n && n.startsWith('/') ? n : '/messages/new'
    } catch {
      return '/messages/new'
    }
  }, [])

  // Уже авторизован? Сразу уходим
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) window.location.replace(nextUrl)
    })()
  }, [nextUrl])

  // Тиканье кулдауна
  useEffect(() => {
    if (cooldown <= 0) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
      return
    }
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      setCooldown((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }
  }, [cooldown])

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setMsg(null)
    if (invalidEmail(email)) { setErr('Введите корректный e-mail'); return }
    if (cooldown > 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Если сервер троттлит (429), выставляем кулдаун из сообщения
        if (res.status === 429) setCooldown(parseCooldownSeconds(data?.error, 60))
        throw new Error(data?.error || 'Не удалось отправить код')
      }
      setMsg('Код отправлен. Проверьте почту.')
      setStep('code')
      // Минимальная пауза перед повторной отправкой
      setCooldown(60)
    } catch (e: any) {
      setErr(e.message || 'Ошибка отправки кода')
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setMsg(null)
    if (code.length !== 6) { setErr('Введите 6-значный код'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, next: nextUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Код не принят')

      // Идём по magic-link, чтобы Supabase поставил cookie
      if (data?.redirect) {
        window.location.href = data.redirect
        return
      }
      // Запасной маршрут
      window.location.href = nextUrl
    } catch (e: any) {
      setErr(e.message || 'Ошибка проверки кода')
    } finally {
      setLoading(false)
    }
  }

  async function resend() {
    if (cooldown || loading) return
    setMsg(null); setErr(null)
    if (invalidEmail(email)) { setErr('Некорректный e-mail'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resend: true }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 429) setCooldown(parseCooldownSeconds(data?.error, 60))
        throw new Error(data?.error || 'Не удалось отправить код повторно')
      }
      setMsg('Код повторно отправлен.')
      setCooldown(60)
    } catch (e: any) {
      setErr(e.message || 'Ошибка при повторной отправке')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100svh] grid place-items-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-medium text-center mb-4">Вход</h1>
        <p className="text-sm text-neutral-600 text-center mb-8">
          Введите e-mail, мы пришлём 6-значный код.
        </p>

        {step === 'email' && (
          <form onSubmit={sendCode} className="space-y-4" noValidate>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              aria-invalid={invalidEmail(email)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full rounded-xl px-4 py-3 bg-black text-white disabled:opacity-60"
              aria-busy={loading}
            >
              {loading ? 'Отправляем…' : cooldown > 0 ? `Повторить через ${cooldown} сек` : 'Получить код'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={verifyCode} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label className="text-sm text-neutral-700">Код из письма</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="••••••"
                className="w-full tracking-widest text-center text-xl border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                value={code}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setCode(v)
                  if (v.length === 6) {
                    setTimeout(() => {
                      const form = (e.target as HTMLInputElement).form as HTMLFormElement | null
                      form?.requestSubmit()
                    }, 10)
                  }
                }}
                aria-invalid={code.length !== 6}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-xl px-4 py-3 bg-black text-white disabled:opacity-60"
              aria-busy={loading}
            >
              {loading ? 'Проверяем…' : 'Войти'}
            </button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-sm text-neutral-600 underline"
              >
                Изменить e-mail
              </button>
              <button
                type="button"
                onClick={resend}
                disabled={!!cooldown || loading}
                className="text-sm text-neutral-700 underline disabled:opacity-60"
                title={cooldown ? `Повторно через ${cooldown} сек.` : 'Отправить код ещё раз'}
              >
                {cooldown ? `Повторно через ${cooldown}s` : 'Отправить снова'}
              </button>
            </div>
          </form>
        )}

        {(msg || err) && (
          <p className={`mt-6 text-center ${err ? 'text-red-600' : 'text-green-700'}`}>
            {err || msg}
          </p>
        )}
      </div>
    </main>
  )
}
