'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Uploader from '@/app/components/Uploader'

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
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <p className="text-sm text-neutral-600">Загружаем…</p>
      </main>
    )
  }

  if (!user) {
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

  return (
    <main className="min-h-[100svh] px-6 py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-medium mb-6">Новое послание</h1>

      <div className="grid gap-6">
        <section className="border rounded-xl p-4">
          <h2 className="font-medium mb-3">Вложения</h2>
          <Uploader />
          <p className="text-xs text-neutral-500 mt-2">
            Файлы приватны. Скачивание будет через подписанные ссылки.
          </p>
        </section>

        <section className="border rounded-xl p-4">
          <h2 className="font-medium mb-2">Другие типы (заглушки)</h2>
          <div className="grid gap-2">
            <button className="border rounded-xl p-3 text-left">Текст</button>
            <button className="border rounded-xl p-3 text-left">Голос</button>
            <button className="border rounded-xl p-3 text-left">Видео</button>
          </div>
        </section>
      </div>
    </main>
  )
}
