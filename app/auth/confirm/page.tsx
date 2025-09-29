'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function AuthConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    // 1) Достаём токены из hash (#access_token=...&refresh_token=...) или query
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : window.location.search)

    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    async function run() {
      try {
        if (!access_token || !refresh_token) {
          // Если Supabase прислал не тот формат, просто ведём на /login
          router.replace('/login')
          return
        }

        // 2) Устанавливаем сессию в браузере
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
        )

        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (error) {
          console.error('setSession error:', error)
          router.replace('/login')
          return
        }

        // 3) Готово: в кабинет
        router.replace('/messages/new')
      } catch (e) {
        console.error(e)
        router.replace('/login')
      }
    }

    run()
  }, [router])

  return (
    <main className="min-h-[100svh] grid place-items-center px-6">
      <p className="text-sm text-neutral-600">Входим…</p>
    </main>
  )
}
