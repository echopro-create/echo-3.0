'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

type Share = {
  id: string
  token: string
  message_id: string
  created_at: string
  expires_at: string | null
  views: number | null
  max_views: number | null
  password_hash: string | null
}

function humanDate(s?: string | null) {
  if (!s) return '—'
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}
function isExpired(s?: string | null) {
  if (!s) return false
  return new Date(s).getTime() < Date.now()
}
function isLimitExceeded(views?: number | null, max?: number | null) {
  if (max == null) return false
  return (views || 0) >= max
}

export default function SharesPage() {
  const [items, setItems] = useState<Share[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)
  const origin = useMemo(() => {
    if (typeof window === 'undefined') return 'https://www.echoproject.space'
    return `${window.location.protocol}//${window.location.host}`
  }, [])

  function shareUrl(token: string) {
    // в проде будет www.echoproject.space, в деве — локалка
    return `${origin}/s/${token}`
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('shares')
          .select('id, token, message_id, created_at, expires_at, views, max_views, password_hash')
          .order('created_at', { ascending: false })
          .limit(200)
        if (error) throw error
        if (!mounted) return
        setItems((data as any) || [])
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'Не удалось загрузить ссылки')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  async function revoke(token: string) {
    if (!confirm('Отозвать эту ссылку?')) return
    setRevoking(token)
    try {
      const { data: s } = await supabase.auth.getSession()
      const t = s.session?.access_token
      if (!t) throw new Error('Нет сессии')
      const res = await fetch('/api/shares/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` },
        body: JSON.stringify({ token })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Не удалось отозвать')
      setItems(prev => prev.filter(x => x.token !== token))
    } catch (e: any) {
      alert(e?.message || 'Ошибка отзыва')
    } finally {
      setRevoking(null)
    }
  }

  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(shareUrl(token))
      // тихая гордость, без снега и фанфар
    } catch {
      alert('Не удалось скопировать ссылку')
    }
  }

  if (loading) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <p className="text-sm text-neutral-600">Грузим список…</p>
      </main>
    )
  }

  return (
    <main className="min-h-[100svh] px-6 py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">Мои ссылки</h1>
        <a href="/messages" className="text-sm underline text-neutral-700">← к сообщениям</a>
      </div>

      {err && <p className="text-red-600 text-sm mb-4">{err}</p>}
      {!err && items.length === 0 && (
        <p className="text-neutral-600">Пусто. Создавай ссылки на странице «Мои послания» кнопкой «Поделиться».</p>
      )}

      <div className="grid gap-3">
        {items.map(s => {
          const expired = isExpired(s.expires_at)
          const limited = isLimitExceeded(s.views, s.max_views)
          return (
            <div key={s.id} className="border rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm">
                    <span className="text-neutral-500">/s/</span>{s.token}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Создано: {humanDate(s.created_at)} · Истекает: {humanDate(s.expires_at)}
                    {s.max_views != null ? ` · Просмотры: ${(s.views ?? 0)}/${s.max_views}` : ` · Просмотры: ${s.views ?? 0}`}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {s.password_hash ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-200">пароль</span> : null}
                    {expired ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">истекла</span> : null}
                    {limited ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">лимит исчерпан</span> : null}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={shareUrl(s.token)} target="_blank" rel="noreferrer" className="text-sm rounded-lg px-3 py-2 border">
                    Открыть
                  </a>
                  <button onClick={() => copy(s.token)} className="text-sm rounded-lg px-3 py-2 border">
                    Скопировать
                  </button>
                  <button
                    onClick={() => revoke(s.token)}
                    disabled={revoking === s.token}
                    className="text-sm rounded-lg px-3 py-2 bg-black text-white disabled:opacity-60"
                  >
                    {revoking === s.token ? 'Отзываем…' : 'Отозвать'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
