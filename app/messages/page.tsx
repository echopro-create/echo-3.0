'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

type Attachment = {
  id: string
  storage_key: string
  mime_type: string | null
  size_bytes: number | null
}

type Message = {
  id: string
  kind: 'text' | 'voice' | 'video' | 'file'
  body: string | null
  created_at: string
  attachments?: Attachment[]
}

function fmtSize(n?: number | null) {
  if (!n || n <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0, x = n
  while (x >= 1024 && i < units.length - 1) { x /= 1024; i++ }
  return `${x.toFixed(x >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

export default function MessagesPage() {
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [items, setItems] = useState<Message[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data: u } = await supabase.auth.getUser()
        setUserEmail((u.user as any)?.email ?? null)

        // тянем мои сообщения вместе с вложениями
        const { data, error } = await supabase
          .from('messages')
          .select('id, kind, body, created_at, attachments ( id, storage_key, mime_type, size_bytes )')
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error
        if (!mounted) return
        setItems((data as any) || [])
      } catch (e: any) {
        setErr(e?.message || 'Не удалось загрузить список')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  async function download(att: Attachment) {
    try {
      const { data: s } = await supabase.auth.getSession()
      const token = s.session?.access_token
      if (!token) throw new Error('Нет сессии')

      const res = await fetch('/api/uploads/sign-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ path: att.storage_key, expires: 60 })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Не удалось получить ссылку')
      window.open(j.url, '_blank', 'noopener,noreferrer')
    } catch (e: any) {
      alert(e?.message || 'Ошибка скачивания')
    }
  }

  async function removeMessage(id: string) {
    if (!confirm('Удалить это послание?')) return
    const { error } = await supabase.from('messages').delete().eq('id', id)
    if (error) { alert('Не удалось удалить'); return }
    setItems(prev => prev.filter(m => m.id !== id))
  }

  if (loading) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <p className="text-sm text-neutral-600">Загружаем…</p>
      </main>
    )
  }

  return (
    <main className="min-h-[100svh] px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">Мои послания</h1>
        <a href="/messages/new" className="rounded-xl bg-black text-white px-4 py-2 text-sm">Создать</a>
      </div>

      {err && <p className="text-red-600 text-sm mb-4">{err}</p>}
      {!err && items.length === 0 && (
        <p className="text-neutral-600">Пусто. Загрузите файлы на странице «Создать».</p>
      )}

      <ul className="space-y-4">
        {items.map(m => (
          <li key={m.id} className="border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-600">
                  {new Date(m.created_at).toLocaleString()} • {m.kind}
                </div>
                {m.body && <div className="mt-1">{m.body}</div>}
              </div>
              <button onClick={() => removeMessage(m.id)} className="text-sm underline text-neutral-700">
                Удалить
              </button>
            </div>

            {!!m.attachments?.length && (
              <div className="mt-3 grid gap-2">
                {m.attachments!.map(a => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="truncate text-sm">
                      {a.storage_key.split('/').slice(1).join('/')}
                      {a.size_bytes ? <span className="text-neutral-500"> · {fmtSize(a.size_bytes)}</span> : null}
                    </div>
                    <button
                      onClick={() => download(a)}
                      className="text-sm rounded-lg px-3 py-1 bg-black text-white"
                    >
                      Скачать
                    </button>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
