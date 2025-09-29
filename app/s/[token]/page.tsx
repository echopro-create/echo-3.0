'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Att = { id: string; storage_key: string; mime_type: string | null; size_bytes: number | null }
type Resolved = {
  ok: true
  protected: boolean
  remaining_views: number | null
  expires_at: string
  message: { id: string; kind: 'text'|'voice'|'video'|'file'; body: string | null; created_at: string }
  attachments: Att[]
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

export default function SharePage() {
  const { token: rawToken } = useParams<{ token: string }>()
  const token = useMemo(() => decodeURIComponent(rawToken ?? ''), [rawToken])

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [needsPw, setNeedsPw] = useState(false)
  const [password, setPassword] = useState('')
  const [data, setData] = useState<Resolved | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<Record<string, string>>({}) // att.id -> signed url
  const [previewing, setPreviewing] = useState<string | null>(null)

  async function resolveShare(pw?: string) {
    if (!token) return
    setErr(null)
    setLoading(true)
    try {
      const res = await fetch('/api/shares/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pw }),
      })
      const j = await res.json()
      if (!res.ok) {
        if (j?.requires_password) setNeedsPw(true)
        throw new Error(j?.error || 'Не удалось открыть ссылку')
      }
      setData(j as Resolved)
      setNeedsPw(false)
    } catch (e: any) {
      setErr(e?.message || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { resolveShare() }, [token])

  async function getSignedFor(a: Att, expires = 120) {
    setPreviewing(a.id)
    try {
      const r = await fetch('/api/shares/sign-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, path: a.storage_key, expires }),
      })
      const j = await r.json()
      if (!r.ok || !j?.url) throw new Error(j?.error || 'Не удалось получить ссылку')
      setPreviewUrl(prev => ({ ...prev, [a.id]: j.url as string }))
    } catch (e: any) {
      alert(e?.message || 'Ошибка получения превью')
    } finally {
      setPreviewing(null)
    }
  }

  async function download(a: Att) {
    try {
      setDownloading(a.id)
      const r = await fetch('/api/shares/sign-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, path: a.storage_key }),
      })
      const j = await r.json()
      if (!r.ok || !j?.url) throw new Error(j?.error || 'Не удалось получить файл')
      const rsp = await fetch(j.url)
      if (!rsp.ok) throw new Error('Ошибка загрузки')
      const blob = await rsp.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = nameFromKey(a.storage_key)
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(e?.message || 'Ошибка скачивания')
    } finally {
      setDownloading(null)
    }
  }

  if (!token) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <p className="text-sm text-red-600">Некорректная ссылка</p>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <p className="text-sm text-neutral-600">Открываем…</p>
      </main>
    )
  }

  return (
    <main className="min-h-[100svh] px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-medium mb-4">Доступ к посланию</h1>

      {err && <p className="text-red-600 text-sm mb-4">{err}</p>}

      {needsPw && (
        <form
          onSubmit={(e)=>{ e.preventDefault(); resolveShare(password) }}
          className="border rounded-xl p-4 mb-6 grid gap-3"
        >
          <label className="text-sm">
            Пароль для доступа
            <input
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              className="mt-1 w-full border rounded-xl px-3 py-2"
              placeholder="••••••••"
            />
          </label>
          <button type="submit" className="rounded-lg px-3 py-2 bg-black text-white" disabled={!password}>
            Открыть
          </button>
        </form>
      )}

      {data && (
        <div className="grid gap-4">
          <div className="text-sm text-neutral-600">
            Опубликовано: {new Date(data.message.created_at).toLocaleString()}
            {data.remaining_views != null ? ` • Осталось просмотров: ${data.remaining_views}` : ''}
            {data.expires_at ? ` • Истекает: ${new Date(data.expires_at).toLocaleString()}` : ''}
          </div>

          {data.message.body && (
            <div className="border rounded-xl p-4 whitespace-pre-wrap">{data.message.body}</div>
          )}

          {!!data.attachments.length && (
            <div className="grid gap-2">
              {data.attachments.map(a => {
                const url = previewUrl[a.id]
                const mime = a.mime_type || ''
                return (
                  <div key={a.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-sm">
                        {a.storage_key.split('/').slice(1).join('/')}
                        {a.size_bytes ? <span className="text-neutral-500"> · {fmtSize(a.size_bytes)}</span> : null}
                        {mime ? <span className="text-neutral-500"> · {mime}</span> : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {(isImage(mime) || isAudio(mime) || isVideo(mime) || isPdf(mime)) && (
                          <button
                            onClick={()=> getSignedFor(a, 180)}
                            disabled={!!previewing && previewing === a.id}
                            className="text-sm underline disabled:opacity-60"
                          >
                            {url ? 'Обновить превью' : (previewing === a.id ? 'Готовим…' : 'Показать')}
                          </button>
                        )}
                        <button
                          onClick={()=>download(a)}
                          disabled={downloading === a.id}
                          className="text-sm rounded-lg px-3 py-1 bg-black text-white disabled:opacity-60"
                        >
                          {downloading === a.id ? 'Готовим…' : 'Скачать'}
                        </button>
                      </div>
                    </div>

                    {/* Превью блок */}
                    {url && (
                      <div className="mt-3">
                        {isImage(mime) && (
                          <img src={url} alt="" className="max-h-[50vh] rounded-lg border" />
                        )}
                        {isAudio(mime) && (
                          <audio src={url} controls className="w-full" />
                        )}
                        {isVideo(mime) && (
                          <video src={url} controls className="w-full max-h-[60vh] rounded-lg border" />
                        )}
                        {isPdf(mime) && (
                          <a href={url} target="_blank" rel="noreferrer" className="underline text-sm">Открыть PDF в новой вкладке</a>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
