'use client'
import { useState, useRef } from 'react'

type Kind = 'text' | 'audio' | 'video' | 'files'
type Mode = 'heartbeat' | 'date'

type Picked = { file: File, id: string }

export default function NewMessageClient() {
  const [tab, setTab] = useState<Kind>('text')
  const [mode, setMode] = useState<Mode>('heartbeat')
  const [content, setContent] = useState('')              // текст послания
  const [deliverAt, setDeliverAt] = useState('')          // datetime-local
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [picked, setPicked] = useState<Picked[]>([])      // выбранные, но ещё не загруженные файлы
  const fileInput = useRef<HTMLInputElement | null>(null)

  function humanBytes(n?: number | null) {
    if (!n || n <= 0) return ''
    const units = ['B','KB','MB','GB']; let i = 0; let x = n
    while (x >= 1024 && i < units.length-1) { x /= 1024; i++ }
    return `${x.toFixed(1)} ${units[i]}`
  }

  async function onSave() {
    setErr(null)
    setBusy(true)
    try {
      // 1) создаём запись сообщения
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
      if (!resp.ok || json?.ok !== true || !json?.id) {
        throw new Error(json?.error || 'Не удалось сохранить послание')
      }
      const messageId: string = json.id

      // 2) если есть выбранные файлы — заливаем каждый с привязкой к message_id
      for (const p of picked) {
        const fd = new FormData()
        fd.append('file', p.file)
        fd.append('message_id', messageId)
        const r = await fetch('/api/media/upload', {
          method: 'POST',
          body: fd,
          credentials: 'include'
        })
        const j = await r.json().catch(() => ({}))
        if (!r.ok || !j?.ok) {
          throw new Error(j?.error || `Не удалось загрузить файл: ${p.file.name}`)
        }
      }

      // успех: к списку
      window.location.href = '/messages'
    } catch (e: any) {
      setErr(e.message || 'Ошибка сохранения')
    } finally {
      setBusy(false)
    }
  }

  function wantFiles(accept: string) {
    fileInput.current?.setAttribute('accept', accept)
    fileInput.current?.click()
  }

  function onPicked(files: FileList | null) {
    if (!files || !files.length) return
    const next: Picked[] = []
    for (const f of Array.from(files)) {
      next.push({ file: f, id: crypto.randomUUID() })
    }
    setPicked(prev => [...prev, ...next])
    if (fileInput.current) fileInput.current.value = ''
  }

  function removePicked(id: string) {
    setPicked(prev => prev.filter(p => p.id !== id))
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

      {tab === 'audio' && (
        <div className="card mt-3 grid gap-2">
          <div className="text-sm">Прикрепите аудио-файл</div>
          <div className="flex gap-2">
            <button className="btn secondary" type="button" onClick={() => wantFiles('audio/*')}>Выбрать аудио</button>
          </div>
        </div>
      )}

      {tab === 'video' && (
        <div className="card mt-3 grid gap-2">
          <div className="text-sm">Прикрепите видео-файл</div>
          <div className="flex gap-2">
            <button className="btn secondary" type="button" onClick={() => wantFiles('video/*')}>Выбрать видео</button>
          </div>
        </div>
      )}

      {tab === 'files' && (
        <div className="card mt-3 grid gap-2">
          <div className="text-sm">Прикрепите файлы</div>
          <div className="flex gap-2">
            <button className="btn secondary" type="button" onClick={() => wantFiles('*/*')}>Выбрать файлы</button>
          </div>
        </div>
      )}

      {/* Список выбранных файлов */}
      {picked.length > 0 && (
        <div className="card mt-3">
          <div className="text-sm font-medium">Будут прикреплены:</div>
          <ul className="mt-2 text-sm divide-y">
            {picked.map(p => (
              <li key={p.id} className="py-1 flex items-center justify-between gap-3">
                <span className="truncate">
                  {p.file.name} {p.file.size ? `· ${humanBytes(p.file.size)}` : ''}
                </span>
                <button className="btn secondary" type="button" onClick={() => removePicked(p.id)}>
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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

      {/* Скрытый input */}
      <input
        ref={fileInput}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => onPicked(e.target.files)}
      />
    </div>
  )
}
