'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

type UserLite = { id: string; email?: string | null }

export default function AuthStatus() {
  const [user, setUser] = useState<UserLite | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      setUser((data.user as any) ?? null)
      setLoading(false)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser((session?.user as any) ?? null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    // Возвращаем на /login с next, чтобы после входа снова попасть куда надо
    window.location.href = `/login?next=${encodeURIComponent('/messages/new')}`
  }

  if (loading) {
    return (
      <div className="text-sm text-neutral-500">
        Проверяем сессию…
      </div>
    )
  }

  if (!user) {
    return (
      <a
        href={`/login?next=${encodeURIComponent('/messages/new')}`}
        className="text-sm underline text-neutral-700"
      >
        Войти
      </a>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-700">
        {user.email || 'Аккаунт'}
      </span>
      <button
        onClick={signOut}
        className="rounded-lg bg-black text-white text-xs px-3 py-2"
      >
        Выйти
      </button>
    </div>
  )
}
