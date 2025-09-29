'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

function parseHash(hash: string) {
  const q = new URLSearchParams((hash || '').replace(/^#/, ''))
  return {
    access_token: q.get('access_token') || '',
    refresh_token: q.get('refresh_token') || '',
  }
}

export default function AuthConfirmPage() {
  const [status, setStatus] = useState<'working' | 'ok' | 'fail'>('working')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const url = new URL(window.location.href)
        const next = url.searchParams.get('next') || '/messages/new'

        const { access_token, refresh_token } = parseHash(window.location.hash)
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) throw error
          if (!cancelled) window.location.replace(next)
          return
        }

        const code = url.searchParams.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          if (!cancelled) window.location.replace(next)
          return
        }

        const { data } = await supabase.auth.getUser()
        if (data.user) {
          if (!cancelled) window.location.replace(next)
          return
        }

        throw new Error('no auth params')
      } catch {
        if (!cancelled) setStatus('fail')
      }
    })()

    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) window.location.replace('/messages/new')
    }, 5000)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [])

  return (
    <main className="min-h-[100svh] grid place-items-center px-6">
      <div className="text-center">
        <h1 className="text-xl font-medium mb-2">
          {status === 'working' ? 'Завершаем вход' : status === 'ok' ? 'Готово' : 'Не удалось войти'}
        </h1>
        <p className="text-sm text-neutral-600">
          {status === 'working'
            ? 'Проверяем ссылку подтверждения'
            : 'Попробуйте запросить новый код и повторить попытку'}
        </p>
      </div>
    </main>
  )
}