'use client'

import { useEffect, useState } from 'react'

type Kind = 'text' | 'audio' | 'video' | 'files'
type Mode = 'heartbeat' | 'date'

export default function EditMessagePage({ params }: { params: { id: string } }) {
  const { id } = params
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [kind, setKind] = useState<Kind>('text')
  const [content, setContent] = useState('')
  const [deliveryMode, setDeliveryMode] = useState<Mode>('heartbeat')
  const [deliverAt, setDeliverAt] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true); setError(null)
        const r = await fetch(`/api/messages/${id}/view`, { credentials: 'include', cache: 'no-store' })
        if (!r.ok) throw new Error('Не удалось загрузить послание')
        const j = await r.json()
        if (!alive) return
        setKind(j.kind as Kind)
        setContent(j.content ?? '')
        setDeliveryMode(j.delivery_mode as Mode)
        setDeliverAt(j.deliver_at ? new Date(j.deliver_at).toISOString().slice(0,16) : '')
      } catch (e:any) {
        if (alive) setError(e.message || 'Ошибка загрузки')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [id])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const body: any = { kind, delivery_mode: deliveryMode }
    if (kind === 'text') body.content = content
    if (deliveryMode === 'date' && deliverAt) body.deliver_at = new Date(deliverAt).toISOString()

    const r = await fetch(`/api/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    })
    const j = await r.json().catch(()=> ({}))
    if (!r.ok || j?.ok !== true) {
      setError(j?.error || 'Не удалось сохранить')
      return
    }
    window.location.href = `/messages/${id}`
  }

  if (loading) return <div className="container py-6"><div className="card">Загрузка…</div></div>
  if (error) return <div className="container py-6"><div className="card text-red-600">{error}</div></div>

  return (
    <div className="container py-6" style={{ maxWidth: 720 }}>
      <div className="flex items-center justify-between">
        <h1 className="title text-2xl font-semibold">Редактировать послание</h1>
        <a className="btn secondary" href={`/messages/${id}`}>Назад</a>
      </div>

      <form onSubmit={onSave} className="card mt-4 grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm">Тип</label>
          <div className="flex flex-wrap gap-2">
            {(['text','audio','video','files'] as const).map(t => (
              <button
                key={t}
                type="button"
                className={`btn ${kind===t ? 'primary':'secondary'}`}
                onClick={()=>setKind(t)}
              >
                {t==='text'?'Текст':t==='audio'?'Голос':t==='video'?'Видео':'Файлы'}
              </button>
            ))}
          </div>
        </div>

        {kind === 'text' && (
          <div className="grid gap-2">
            <label className="text-sm">Текст</label>
            <textarea className="border rounded-xl px-3 py-2 min-h-[160px]" value={content} onChange={e=>setContent(e.target.value)} />
          </div>
        )}

        <div className="grid gap-2">
          <label className="text-sm">Доставка</label>
          <div className="grid gap-1">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="mode" checked={deliveryMode==='heartbeat'} onChange={()=>setDeliveryMode('heartbeat')} />
              По пульсу (Dead-man switch)
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="mode" checked={deliveryMode==='date'} onChange={()=>setDeliveryMode('date')} />
              По дате
            </label>
          </div>
        </div>

        {deliveryMode==='date' && (
          <div className="grid gap-2">
            <label className="text-sm">Дата и время доставки</label>
            <input className="border rounded-xl px-3 py-2" type="datetime-local" value={deliverAt} onChange={e=>setDeliverAt(e.target.value)} />
          </div>
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2">
          <button className="btn primary" type="submit">Сохранить</button>
          <a className="btn secondary" href={`/messages/${id}`}>Отмена</a>
        </div>
      </form>
    </div>
  )
}
