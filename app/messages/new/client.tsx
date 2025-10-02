'use client'
import { useState } from 'react'

type Kind = 'text' | 'audio' | 'video' | 'files'
type Mode = 'heartbeat' | 'date'

export default function NewMessageClient() {
  const [tab, setTab] = useState<Kind>('text')
  const [mode, setMode] = useState<Mode>('heartbeat')
  const [content, setContent] = useState('')              // для текста
  const [deliverAt, setDeliverAt] = useState('')          // ISO-local datetime (yyyy-mm-ddThh:mm)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSave() {
    setErr(null)
    setBusy(true)
    try {
      const payload: any = {
        kind: tab,
        delivery_mode: mode,
      }
      if (tab === 'text') payload.content = content
      if (mode === 'date' && deliverAt) payload.deliver_at = new Date(deliverAt).toISOString()

      const resp = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      const json = await resp.json()
      if (!resp.ok || json?.ok !== true) {
        throw new Error(json?.error || 'Не удалось сохранить послание')
      }
      // успех: идём к списку
      window.location.href = '/messages'
    } catch (e: any) {
      setErr(e.message || 'Ошибка сохранения')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container py-6" style={{ maxWidth: 720 }}>
      <h1 className="title text-2xl font-semibold">Создать послание</h1>

      {/* Тип послания */}
      <div className="card mt-4 grid gap-3">
        <strong className="text-sm">Тип послания</strong>
        <div className="flex flex-wrap gap-2">
          {(['text','audio','video','files'] as const).map(t => (
            <button
              key={t}
              className={`btn ${tab===t ? 'primary' : 'secondary'}`}
              onClick={() => setTab(t)}
              type="button"
            >
              {t==='text'?'Текст':t==='audio'?'Голос':t==='video'?'Видео':'Файлы'}
            </button>
          ))}
        </div>
      </div>

      {/* Содержимое */}
      {tab === 'text' && (
        <div className="card mt-3 grid gap-2">
          <label className="text-sm">Текст послания</label>
          <textarea
            className="border rounded-xl px-3 py-2 min-h-[160px]"
            placeholder="Напишите что-нибудь важное..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      )}
      {tab === 'audio' && <div className="card mt-3">Рекордер аудио (заглушка)</div>}
      {tab === 'video' && <div className="card mt-3">Рекордер видео (заглушка)</div>}
      {tab === 'files' && <div className="card mt-3">Загрузчик файлов (заглушка)</div>}

      {/* Доставка */}
      <div className="card mt-3 grid gap-3">
        <strong className="text-sm">Доставка</strong>
        <div className="grid gap-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={mode === 'heartbeat'}
              onChange={() => setMode('heartbeat')}
            />
            По пульсу (Dead-man switch)
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={mode === 'date'}
              onChange={() => setMode('date')}
            />
            По дате
          </label>
        </div>

        {mode === 'date' && (
          <div className="grid gap-2">
            <label className="text-sm">Дата и время доставки</label>
            <input
              className="border rounded-xl px-3 py-2"
              type="datetime-local"
              value={deliverAt}
              onChange={(e) => setDeliverAt(e.target.value)}
            />
          </div>
        )}

        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="btn primary mt-2" onClick={onSave} disabled={busy}>
          {busy ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}
