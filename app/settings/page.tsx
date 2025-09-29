'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

type ExportPayload = {
  user: { id: string; email: string | null }
  messages: any[]
  attachments: any[]
  shares: any[]
  generated_at: string
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (!mounted) return
        if (!data.user) {
          window.location.replace('/login?next=/settings')
          return
        }
        setUserEmail((data.user as any).email ?? null)
      } catch (e: any) {
        setErr(e?.message || 'Не удалось загрузить профиль')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  async function doSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function doExport() {
    try {
      setBusy('export')
      const { data: s } = await supabase.auth.getSession()
      const token = s.session?.access_token
      if (!token) throw new Error('Нет сессии')
      const res = await fetch('/api/account/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const j: ExportPayload | any = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Не удалось сформировать экспорт')

      const blob = new Blob([JSON.stringify(j, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `echo-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(e?.message || 'Ошибка экспорта')
    } finally {
      setBusy(null)
    }
  }

  async function doDelete() {
    if (!confirm('Удалить аккаунт и все данные без возможности восстановления?')) return
    try {
      setBusy('delete')
      const { data: s } = await supabase.auth.getSession()
      const token = s.session?.access_token
      if (!token) throw new Error('Нет сессии')
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Не удалось удалить аккаунт')
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (e: any) {
      alert(e?.message || 'Ошибка удаления')
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <p className="text-sm text-neutral-600">Загружаем…</p>
      </main>
    )
  }

  return (
    <main className="min-h-[100svh] px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-medium mb-6">Настройки</h1>

      {err && <p className="text-red-600 text-sm mb-4">{err}</p>}

      <section className="border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-medium mb-1">Профиль</h2>
        <p className="text-sm text-neutral-700">Email: {userEmail || '—'}</p>
        <div className="mt-4 flex gap-3">
          <a href="/messages" className="rounded-lg px-3 py-2 border">К посланиям</a>
          <button onClick={doSignOut} className="rounded-lg px-3 py-2 border">Выйти</button>
        </div>
      </section>

      <section className="border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-medium mb-2">Экспорт данных</h2>
        <p className="text-sm text-neutral-600 mb-3">
          Скачаем JSON с вашими сообщениями, вложениями (метаданные) и ссылками.
        </p>
        <button
          onClick={doExport}
          disabled={busy === 'export'}
          className="rounded-lg px-3 py-2 bg-black text-white disabled:opacity-60"
        >
          {busy === 'export' ? 'Готовим…' : 'Скачать экспорт'}
        </button>
      </section>

      <section className="border rounded-xl p-4">
        <h2 className="text-lg font-medium mb-2">Опасная зона</h2>
        <p className="text-sm text-neutral-600 mb-3">
          Удаление аккаунта с очисткой файлов в хранилище и всех записей.
        </p>
        <button
          onClick={doDelete}
          disabled={busy === 'delete'}
          className="rounded-lg px-3 py-2 bg-red-600 text-white disabled:opacity-60"
        >
          {busy === 'delete' ? 'Удаляем…' : 'Удалить аккаунт'}
        </button>
      </section>
    </main>
  )
}
