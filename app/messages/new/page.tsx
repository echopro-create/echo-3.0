'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Uploader from '@/app/components/Uploader'

// пусть страница рендерится динамически, без попыток статического экспорта
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

type Kind = 'text' | 'voice' | 'video' | 'file'

function PageInner() {
  const sp = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<null | { id: string; email?: string }>(null)

  const kind = useMemo<Kind | null>(() => {
    const k = (sp.get('type') || '').toLowerCase()
    if (!k) return null
    return ['text', 'voice', 'video', 'file'].includes(k) ? (k as Kind) : null
  }, [sp])

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

  // режим выбора типа послания
  if (!kind) {
    return (
      <main className="min-h-[100svh] px-6 py-10 max-w-3xl mx-auto">
        <h1 className="text-2xl font-medium mb-6">Новое послание</h1>

        <div className="grid gap-4">
          <Link href="/messages/new?type=text" className="border rounded-xl p-4 hover:bg-neutral-50">
            Текст
          </Link>
          <Link href="/messages/new?type=voice" className="border rounded-xl p-4 hover:bg-neutral-50">
            Голос
          </Link>
          <Link href="/messages/new?type=video" className="border rounded-xl p-4 hover:bg-neutral-50">
            Видео
          </Link>
          <Link href="/messages/new?type=file" className="border rounded-xl p-4 hover:bg-neutral-50">
            Файлы
          </Link>
        </div>
      </main>
    )
  }

  // режим конкретного типа
  return (
    <main className="min-h-[100svh] px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">
          {kind === 'file' ? 'Вложения' :
           kind === 'text' ? 'Текстовое послание' :
           kind === 'voice' ? 'Голосовое послание' :
           'Видео-послание'}
        </h1>

        <button
          onClick={() => router.push('/messages/new')}
          className="text-sm text-neutral-600 underline"
        >
          ← выбрать другой тип
        </button>
      </div>

      {kind === 'file' && (
        <section className="border rounded-xl p-4">
          <Uploader />
          <p className="text-xs text-neutral-500 mt-2">
            Файлы приватны. Загрузка и скачивание идут через подписанные ссылки.
          </p>
        </section>
      )}

      {kind !== 'file' && (
        <section className="border rounded-xl p-4">
          <p className="text-neutral-600 text-sm">
            Этот тип пока в разработке. Начни с «Файлы».
          </p>
        </section>
      )}
    </main>
  )
}

function Fallback() {
  return (
    <main className="min-h-[100svh] grid place-items-center px-6">
      <p className="text-sm text-neutral-600">Готовим страницу…</p>
    </main>
  )
}

export default function Page() {
  // Требование Next 15: useSearchParams() — только внутри Suspense
  return (
    <Suspense fallback={<Fallback />}>
      <PageInner />
    </Suspense>
  )
}
