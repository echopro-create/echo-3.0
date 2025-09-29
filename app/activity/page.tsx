'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

type Event = {
  id: string
  created_at: string
  action: string
  ip: string | null
  subject_type: string | null
  subject_id: string | null
  meta: any
}

function ts(s: string) { return new Date(s).toLocaleString() }

export default function ActivityPage() {
  const [items, setItems] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) { window.location.replace('/login?next=/activity'); return }
        const { data, error } = await supabase
          .from('audit_events')
          .select('id, created_at, action, ip, subject_type, subject_id, meta')
          .order('created_at', { ascending: false })
          .limit(200)
        if (error) throw error
        if (!mounted) return
        setItems((data as any) || [])
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'Не удалось загрузить журнал')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <main className="min-h-[100svh] grid place-items-center px-6">
        <p className="text-sm text-neutral-600">Грузим журнал…</p>
      </main>
    )
  }

  return (
    <main className="min-h-[100svh] px-6 py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">Журнал действий</h1>
        <div className="flex items-center gap-2">
          <a href="/messages" className="rounded-xl px-4 py-2 text-sm border">К посланиям</a>
          <a href="/settings" className="rounded-xl px-4 py-2 text-sm border">Настройки</a>
        </div>
      </div>

      {err && <p className="text-red-600 text-sm mb-4">{err}</p>}
      {!err && items.length === 0 && (
        <p className="text-neutral-600">Пока пусто. Но это ненадолго.</p>
      )}

      <ul className="grid gap-3">
        {items.map(ev => (
          <li key={ev.id} className="border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">{ev.action}</div>
                <div className="text-neutral-600">{ts(ev.created_at)} · IP: {ev.ip || '—'}</div>
              </div>
              <div className="text-right text-xs text-neutral-600">
                {ev.subject_type ? `${ev.subject_type}${ev.subject_id ? `:${ev.subject_id}` : ''}` : ''}
              </div>
            </div>
            {ev.meta ? (
              <pre className="mt-3 text-xs bg-neutral-50 border rounded-lg p-3 overflow-auto max-h-48">
                {JSON.stringify(ev.meta, null, 2)}
              </pre>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  )
}
