'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

type UserLite = { id: string; email?: string | null }

export default function AuthStatus() {
  const [user, setUser] = useState<UserLite | null>(null)
  const [loading, setLoading] = useState(true)
  const nextTarget = '/messages/new'

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
    window.location.href = `/login?next=${encodeURIComponent(nextTarget)}`
  }

  if (loading) {
    return <div className="text-sm text-neutral-500">Проверяем сессию…</div>
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Глобальная ссылка на журнал активности */}
      <Link href="/activity" className="rounded-xl px-3 py-2 text-sm border">
        Журнал
      </Link>

      <Link href="/messages/new" className="rounded-xl px-3 py-2 text-sm bg-black text-white">
        Создать
      </Link>

      {user ? (
        <>
          <span className="hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 border text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {user.email || 'Аккаунт'}
          </span>
          <button onClick={signOut} className="rounded-xl px-3 py-2 text-sm border">
            Выйти
          </button>
        </>
      ) : (
        <a
          href={`/login?next=${encodeURIComponent(nextTarget)}`}
          className="text-sm underline text-neutral-700"
        >
          Войти
        </a>
      )}
    </div>
  )
}
