'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

type FileItem = {
  id: string
  name: string
  mime_type: string | null
  size_bytes: number | null
  url: string
}
type MessageLite = {
  id: string
  kind: 'text' | 'voice' | 'video' | 'file'
  body: string | null
  created_at: string
}

function fmtSize(n?: number | null) {
  if (!n || n <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0, x = n!
  while (x >= 1024 && i < units.length - 1) { x /= 1024; i++ }
  return `${x.toFixed(x >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}
function isPreviewable(m?: string | null) {
  if (!m) return false
  return m.startsWith('image/') || m.startsWith('video/') || m.startsWith('audio/')
}

export default function ShareViewerPage() {
  const { token } = useParams<{ token: string }>()
  const tkn = useMemo(() => String(token || ''), [token])

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<MessageLite | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [needPassword, setNeedPassword] = useState(false)
  const [pw, setPw] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true); setErr(null); setNeedPassword(false)
    try {
      const res = await fetch(`/api/shares/get?token=${encodeURIComponent(tkn)}`, { cache: 'no-store' })
      const j = await res.json()
      if (res.status === 401 && j?.error === 'password_required') {
        setNeedPassword(true)
        return
      }
      if (!res.ok) throw new Error(j?.error || 'Ссылка недоступна')
      setMsg(j.message)
      setFiles(j.files || [])
    } catch (e: any) {
      setErr(e?.message || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!pw.trim()) return
    setSubmitting(true); setErr(null)
    try {
      const res = await fetch('/api/shares/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tkn, password: pw })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error === 'password_invalid' ? 'Неверный пароль' : (j?.error || 'Ошибка'))
      setMsg(j.message)
      setFiles(j.files || [])
      setNeedPassword(false)
    } catch (e: any) {
      setErr(e?.message || 'Ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => { load() }, [tkn])

  if (loading) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <p className="text-sm text-neutral-600">Открываем ссылку…</p>
      </main>
    )
  }
  if (needPassword) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <form onSubmit={submitPassword} className="w-full max-w-xs space-y-3">
          <h1 className="text-xl font-medium text-center">Требуется пароль</h1>
          <input
            type="password"
            placeholder="Пароль к ссылке"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
          />
          <button
            type="submit"
            disabled={submitting || !pw}
            className="w-full rounded-xl px-4 py-3 bg-black text-white disabled:opacity-60"
          >
            {submitting ? 'Проверяем…' : 'Открыть'}
          </button>
          {err && <p className="text-center text-red-600 text-sm">{err}</p>}
        </form>
      </main>
    )
  }
  if (err || !msg) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <p className="text-red-600">{err || 'Ссылка недоступна'}</p>
      </main>
    )
  }

  return (
    <main className="min-h-[100svh] px-6 py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-medium mb-4">Послание</h1>
      {msg.body && <div className="border rounded-xl p-4 mb-6 whitespace-pre-wrap">{msg.body}</div>}

      <div className="grid gap-4">
        {files.map(f => (
          <div key={f.id} className="border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="truncate text-sm">
                {f.name}
                {f.size_bytes ? <span className="text-neutral-500"> · {fmtSize(f.size_bytes)}</span> : null}
              </div>
              <a href={f.url} download className="text-sm rounded-lg px-3 py-1 bg-black text-white">Скачать</a>
            </div>
            {isPreviewable(f.mime_type) && (
              <>
                {f.mime_type!.startsWith('image/') && (
                  <img src={f.url} alt="" className="max-h-[60vh] rounded-lg object-contain" />
                )}
                {f.mime_type!.startsWith('video/') && (
                  <video src={f.url} controls className="w-full rounded-lg" />
                )}
                {f.mime_type!.startsWith('audio/') && (
                  <audio src={f.url} controls className="w-full" />
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
