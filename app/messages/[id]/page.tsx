'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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
function fileNameFromKey(key: string) {
  const parts = key.split('/')
  return parts[parts.length - 1] || 'download'
}
function isPreviewable(m?: string | null) {
  if (!m) return false
  return m.startsWith('image/') || m.startsWith('video/') || m.startsWith('audio/')
}

export default function MessageDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const messageId = useMemo(() => String((params as any)?.id || ''), [params])
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<Message | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!messageId) throw new Error('Не указан идентификатор')
        const { data, error } = await supabase
          .from('messages')
          .select('id, kind, body, created_at, attachments ( id, storage_key, mime_type, size_bytes )')
          .eq('id', messageId)
          .maybeSingle()
        if (error) throw error
        if (!data) throw new Error('Послание не найдено')
        if (!mounted) return
        setItem(data as any)
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'Не удалось загрузить послание')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [messageId])

  // Получаем подписанные URL для предпросмотра
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!item?.attachments?.length) return
      try {
        const { data: s } = await supabase.auth.getSession()
        const token = s.session?.access_token
        if (!token) return
        const next: Record<string, string> = {}
        for (const a of item.attachments) {
          if (!isPreviewable(a.mime_type)) continue
          const res = await fetch('/api/uploads/sign-download', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ path: a.storage_key, expires: 300 })
          })
          const j = await res.json()
          if (res.ok && j?.url) next[a.id] = j.url
        }
        if (!cancelled) setUrls(next)
      } catch {
        /* молча, превью не обязательно */
      }
    })()
    return () => { cancelled = true }
  }, [item])

  async function download(att: Attachment) {
    try {
      setDownloading(att.id)
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
      if (!res.ok || !j?.url) throw new Error(j?.error || 'Не удалось получить ссылку')

      const rsp = await fetch(j.url)
      if (!rsp.ok) throw new Error('Ошибка загрузки файла')
      const blob = await rsp.blob()

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileNameFromKey(att.storage_key)
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(e?.message || 'Ошибка скачивания')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <p className="text-sm text-neutral-600">Загружаем…</p>
      </main>
    )
  }
  if (err || !item) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <div className="text-center">
          <p className="text-red-600">{err || 'Не найдено'}</p>
          <button onClick={() => router.push('/messages')} className="mt-4 underline">← к списку</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[100svh] px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">Послание</h1>
        <a href="/messages" className="text-sm underline text-neutral-700">← к списку</a>
      </div>

      <div className="border rounded-xl p-4">
        <div className="text-sm text-neutral-600">
          {new Date(item.created_at).toLocaleString()} • {item.kind}
        </div>
        {item.body && <div className="mt-3 whitespace-pre-wrap">{item.body}</div>}

        {!!item.attachments?.length && (
          <div className="mt-4 grid gap-4">
            {item.attachments!.map(a => (
              <div key={a.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="truncate text-sm">
                    {a.storage_key.split('/').slice(1).join('/')}
                    {a.size_bytes ? <span className="text-neutral-500"> · {fmtSize(a.size_bytes)}</span> : null}
                  </div>
                  <button
                    onClick={() => download(a)}
                    disabled={downloading === a.id}
                    className="text-sm rounded-lg px-3 py-1 bg-black text-white disabled:opacity-60"
                  >
                    {downloading === a.id ? 'Готовим…' : 'Скачать'}
                  </button>
                </div>

                {isPreviewable(a.mime_type) && urls[a.id] && (
                  <>
                    {a.mime_type!.startsWith('image/') && (
                      <img src={urls[a.id]} alt="" className="max-h-[60vh] rounded-lg object-contain" />
                    )}
                    {a.mime_type!.startsWith('video/') && (
                      <video src={urls[a.id]} controls className="w-full rounded-lg" />
                    )}
                    {a.mime_type!.startsWith('audio/') && (
                      <audio src={urls[a.id]} controls className="w-full" />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
