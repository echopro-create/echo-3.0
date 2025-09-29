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
}

type Share = {
  id: string
  token: string
  created_at: string
  expires_at: string
  max_views: number | null
  views_count: number
  protected: boolean
}

function fmtSize(n?: number | null) {
  if (!n || n <= 0) return ''
  const units = ['B','KB','MB','GB']
  let i = 0, x = n
  while (x >= 1024 && i < units.length - 1) { x /= 1024; i++ }
  return `${x.toFixed(x >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}
function nameFromKey(k: string) {
  const parts = k.split('/')
  return parts[parts.length - 1] || 'download'
}
const isImage = (m?: string|null)=> !!m && m.startsWith('image/')
const isAudio = (m?: string|null)=> !!m && m.startsWith('audio/')
const isVideo = (m?: string|null)=> !!m && m.startsWith('video/')
const isPdf   = (m?: string|null)=> m === 'application/pdf'

export default function MessagePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const msgId = useMemo(()=>decodeURIComponent(id ?? ''), [id])

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const [message, setMessage] = useState<Message | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [shares, setShares] = useState<Share[]>([])

  const [downloading, setDownloading] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)

  const [previewUrl, setPreviewUrl] = useState<Record<string, string>>({})
  const [previewing, setPreviewing] = useState<string | null>(null)

  // параметры новой ссылки
  const [ttl, setTtl] = useState(86400)
  const [pw, setPw] = useState('')
  const [maxViews, setMaxViews] = useState<number | ''>('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data: auth } = await supabase.auth.getUser()
        if (!auth.user) { router.replace(`/login?next=/messages/${encodeURIComponent(msgId)}`); return }

        const [{ data: msg, error: mErr }, { data: atts, error: aErr }] = await Promise.all([
          supabase.from('messages').select('id, kind, body, created_at').eq('id', msgId).maybeSingle(),
          supabase.from('attachments').select('id, storage_key, mime_type, size_bytes').eq('message_id', msgId).order('created_at', { ascending: true }),
        ])
        if (mErr) throw mErr
        if (!msg) { setErr('Не найдено'); return }
        if (!mounted) return
        setMessage(msg as any)
        setAttachments((atts as any[]) || [])

        const { data: s } = await supabase.auth.getSession()
        const token = s.session?.access_token
        if (token) {
          const r = await fetch('/api/shares/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ messageId: msgId })
          })
          if (r.ok) {
            const j = await r.json()
            if (mounted) setShares(j.items || [])
          }
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'Ошибка загрузки')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [msgId, router])

  async function signFor(path: string, expires = 180) {
    try {
      const { data: s } = await supabase.auth.getSession()
      const token = s.session?.access_token
      if (!token) throw new Error('Нет сессии')
      const res = await fetch('/api/uploads/sign-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ path, expires })
      })
      const j = await res.json()
      if (!res.ok || !j?.url) throw new Error(j?.error || 'Не удалось получить ссылку')
      return j.url as string
    } catch (e: any) {
      throw e
    }
  }

  async function showPreview(att: Attachment) {
    try {
      setPreviewing(att.id)
      const url = await signFor(att.storage_key, 180)
      setPreviewUrl(prev => ({ ...prev, [att.id]: url }))
    } catch (e: any) {
      alert(e?.message || 'Ошибка превью')
    } finally {
      setPreviewing(null)
    }
  }

  async function createShare() {
    try {
      setCreating(true)
      const { data: s } = await supabase.auth.getSession()
      const token = s.session?.access_token
      if (!token) throw new Error('Нет сессии')
      const res = await fetch('/api/shares/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          messageId: msgId,
          expiresSeconds: ttl,
          password: pw || undefined,
          maxViews: maxViews === '' ? undefined : Number(maxViews)
        })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Не удалось создать ссылку')
      const url = j.url as string
      await navigator.clipboard.writeText(url)
      alert(`Ссылка создана и скопирована:\n${url}`)
      setPw(''); setMaxViews('')
      setShares(prev => [
        { id: j.id || 'n/a', token: j.token, created_at: new Date().toISOString(), expires_at: j.expires_at, max_views: j.max_views ?? null, views_count: 0, protected: !!j.protected },
        ...prev
      ])
    } catch (e: any) {
      alert(e?.message || 'Ошибка создания ссылки')
    } finally {
      setCreating(false)
    }
  }

  async function revokeShare(tkn: string) {
    try {
      setRevoking(tkn)
      const { data: s } = await supabase.auth.getSession()
      const token = s.session?.access_token
      if (!token) throw new Error('Нет сессии')
      const res = await fetch('/api/shares/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ token: tkn })
      })
      if (!res.ok) throw new Error('Не удалось отозвать')
      setShares(prev => prev.filter(x => x.token !== tkn))
    } catch (e: any) {
      alert(e?.message || 'Ошибка отзыва')
    } finally {
      setRevoking(null)
    }
  }

  async function download(att: Attachment) {
    try {
      setDownloading(att.id)
      const url = await signFor(att.storage_key, 60)
      const rsp = await fetch(url)
      if (!rsp.ok) throw new Error('Ошибка загрузки')
      const blob = await rsp.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = nameFromKey(att.storage_key)
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(a.href)
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

  if (err || !message) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <div className="text-center">
          <p className="text-red-600 text-sm mb-2">{err || 'Не найдено'}</p>
          <a href="/messages" className="underline text-sm">К списку</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[100svh] px-6 py-10 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Послание</h1>
        <div className="flex items-center gap-2">
          <a href="/messages" className="rounded-xl px-4 py-2 text-sm border">К списку</a>
          <a href="/activity" className="rounded-xl px-4 py-2 text-sm border">Журнал</a>
        </div>
      </div>

      <div className="border rounded-xl p-4 mb-6">
        <div className="text-sm text-neutral-600">
          {new Date(message.created_at).toLocaleString()} • {message.kind}
        </div>
        {message.body && <div className="mt-2 whitespace-pre-wrap">{message.body}</div>}
      </div>

      {!!attachments.length && (
        <section className="border rounded-xl p-4 mb-6">
          <h2 className="text-lg font-medium mb-2">Вложения</h2>
          <div className="grid gap-3">
            {attachments.map(a => {
              const url = previewUrl[a.id]
              const mime = a.mime_type || ''
              return (
                <div key={a.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm">
                      {a.storage_key.split('/').slice(1).join('/')}
                      {a.size_bytes ? <span className="text-neutral-500"> · {fmtSize(a.size_bytes)}</span> : null}
                      {mime ? <span className="text-neutral-500"> · {mime}</span> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      {(isImage(mime) || isAudio(mime) || isVideo(mime) || isPdf(mime)) && (
                        <button
                          onClick={()=>showPreview(a)}
                          disabled={previewing === a.id}
                          className="text-sm underline disabled:opacity-60"
                        >
                          {url ? 'Обновить превью' : (previewing === a.id ? 'Готовим…' : 'Показать')}
                        </button>
                      )}
                      <button
                        onClick={() => download(a)}
                        disabled={downloading === a.id}
                        className="text-sm rounded-lg px-3 py-1 bg-black text-white disabled:opacity-60"
                      >
                        {downloading === a.id ? 'Готовим…' : 'Скачать'}
                      </button>
                    </div>
                  </div>

                  {url && (
                    <div className="mt-3">
                      {isImage(mime) && <img src={url} alt="" className="max-h-[50vh] rounded-lg border" />}
                      {isAudio(mime) && <audio src={url} controls className="w-full" />}
                      {isVideo(mime) && <video src={url} controls className="w-full max-h-[60vh] rounded-lg border" />}
                      {isPdf(mime) && <a href={url} target="_blank" rel="noreferrer" className="underline text-sm">Открыть PDF в новой вкладке</a>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-medium mb-3">Создать ссылку для доступа</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm">
            TTL (сек)
            <input type="number" value={ttl} onChange={e=>setTtl(Math.max(60, Number(e.target.value || 0)))}
                   className="mt-1 w-full border rounded-xl px-3 py-2"/>
          </label>
          <label className="text-sm">
            Пароль (опц.)
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)}
                   className="mt-1 w-full border rounded-xl px-3 py-2"/>
          </label>
          <label className="text-sm">
            Лимит просмотров (опц.)
            <input type="number" min={1} value={maxViews}
                   onChange={e=>setMaxViews(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                   className="mt-1 w-full border rounded-xl px-3 py-2"/>
          </label>
        </div>
        <button onClick={createShare} disabled={creating}
                className="mt-3 rounded-lg px-3 py-2 bg-black text-white disabled:opacity-60">
          {creating ? 'Готовим…' : 'Создать и скопировать'}
        </button>
      </section>

      <section className="border rounded-xl p-4">
        <h2 className="text-lg font-medium mb-2">Активные ссылки</h2>
        {!shares.length && <p className="text-sm text-neutral-600">Пока нет.</p>}
        <ul className="grid gap-2">
          {shares.map(s => {
            const url = `https://www.echoproject.space/s/${s.token}`
            const remaining = s.max_views != null ? Math.max(0, s.max_views - (s.views_count || 0)) : null
            return (
              <li key={s.token} className="border rounded-lg px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <div className="truncate"><a className="underline" href={url} target="_blank" rel="noreferrer">{url}</a></div>
                    <div className="text-neutral-600">
                      Истекает: {new Date(s.expires_at).toLocaleString()}
                      {remaining != null ? ` • Осталось просмотров: ${remaining}` : ''}
                      {s.protected ? ' • Пароль' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={async()=>{ await navigator.clipboard.writeText(url) }} className="text-sm underline">Копировать</button>
                    <button onClick={()=>revokeShare(s.token)} disabled={revoking === s.token} className="text-sm underline text-red-600 disabled:opacity-60">
                      {revoking === s.token ? 'Отзываем…' : 'Отозвать'}
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
