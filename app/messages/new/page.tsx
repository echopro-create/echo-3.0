'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export default function NewMessagePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<null | { id: string; email?: string }>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      setUser((data.user as any) || null)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <p className="text-sm text-neutral-600">Загружаем…</p>
      </main>
    )
  }

  if (!user) {
    // Никаких серверных редиректов. Спокойная CTA, чтобы не зациклиться.
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <div className="text-center">
          <h1 className="text-xl font-medium mb-2">Нужен вход</h1>
          <p className="text-sm text-neutral-600 mb-4">
            Чтобы создать послание, войдите в аккаунт.
          </p>
          <a
            href={`/login?next=${encodeURIComponent('/messages/new')}`}
            className="inline-block rounded-xl bg-black text-white px-4 py-3"
          >
            Войти
          </a>
        </div>
      </main>
    )
  }

  // Здесь можешь оставить свою текущую форму создания послания.
  // Вставил безопасный минимал, чтобы страница не падала.
  return (
    <main className="min-h-[100svh] px-6 py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-medium mb-6">Новое послание</h1>

      <div className="grid gap-4">
        <a href="/messages/new?type=text" className="border rounded-xl p-4 hover:bg-neutral-50">
          Текст
        </a>
        <a href="/messages/new?type=voice" className="border rounded-xl p-4 hover:bg-neutral-50">
          Голос
        </a>
        <a href="/messages/new?type=video" className="border rounded-xl p-4 hover:bg-neutral-50">
          Видео
        </a>
        <a href="/messages/new?type=file" className="border rounded-xl p-4 hover:bg-neutral-50">
          Файлы
        </a>
      </div>
    </main>
  )
}
