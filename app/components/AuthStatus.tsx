'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export default function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data } = await supabase.auth.getUser()
      if (mounted) {
        setEmail(data.user?.email ?? null)
        setReady(true)
      }
    }

    // Подхватываем текущую сессию и слушаем изменения
    init()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setEmail(session?.user?.email ?? null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (!ready) {
    // лёгкий плейсхолдер, чтобы не мигало
    return <span className="inline-block w-16 h-6 rounded-xl bg-black/5" aria-hidden />
  }

  if (!email) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-black hover:text-white transition"
        aria-label="Перейти к входу"
      >
        Войти
      </Link>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm bg-white"
      aria-live="polite"
    >
      <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
      {email}
    </span>
  )
}
