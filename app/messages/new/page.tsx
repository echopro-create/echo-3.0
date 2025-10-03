'use client'
import { useEffect, useRef, useState } from 'react'
import RecorderBase from '@/app/components/RecorderBase'
import VideoRecorder from '@/app/components/VideoRecorder'

type Kind = 'text' | 'audio' | 'video' | 'files'
type Mode = 'heartbeat' | 'date'
type Picked = { file: File, id: string, preview?: string }

export default function NewMessagePage() {
  const [tab, setTab] = useState<Kind>('text')
  const [mode, setMode] = useState<Mode>('heartbeat')
  const [content, setContent] = useState('')              // текст послания
  const [deliverAt, setDeliverAt] = useState('')          // datetime-local
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [picked, setPicked] = useState<Picked[]>([])      // выбранные файлы (ручной выбор)
  const [messageId, setMessageId] = useState<string | null>(null) // черновик для вложений

  const fileInput = useRef<HTMLInputElement | null>(null)

  function humanBytes(n?: number | null) {
    if (!n || n <= 0) return ''
    const units = ['B','KB','MB','GB']; let i = 0; let x = n
    while (x >= 1024 && i < units.length-1) { x /= 1024; i++ }
    return `${x.toFixed(1)} ${units[i]}`
  }

  // Создание черновика сообщения для вкладок с вложениями
  async function ensureMessageId(kind: Kind): Promise<string> {
    if (messageId) return messageId
    const payload: any = { kind, delivery_mode: mode }
    if (mode === 'date' && deliverAt) payload.deliver_at = new Date(deliverAt).toISOString()

    const resp = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
    const json = await resp.json().catch(() => ({}))
    if (!resp.ok || json?.ok !== true || !json?.id) {
      throw new Error(json?.error || 'Не удалось создать черновик послания')
    }
    setMessageId(json.id as string)
    return json.id as string
  }

  // Автосоздание черновика при переходе на аудио/видео/файлы
  useEffect(() => {
    (async () => {
      if ((tab === 'audio' || tab === 'video' || tab === 'files') && !messageId) {
        try {
          await ensureMessageId(tab)
        } catch (e: any) {
          setErr(e?.message || 'Не удалось подготовить черновик')
        }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  async function onSave() {
    setErr(null)
    setBusy(true)
    try {
      // Текстовое послание: просто создаём и уходим
      if (tab === 'text') {
        const payload: any = { kind: 'text', delivery_mode: mode, content }
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
        window.location.href = '/messages'
        return
      }

      // Для аудио/видео/файлов: убеждаемся, что черновик есть
      const id = await ensureMessageId(tab)

      // Обновляем режим доставки/дату (на случай изменения после создания черновика)
      {
        const patch: any = { delivery_mode: mode }
        if (mode === 'date' && deliverAt) patch.deliver_at = new Date(deliverAt).toISOString()
        await fetch(`/api/messages/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ _method: 'PATCH', ...patch })
        }).catch(() => {})
      }

      // Догружаем вручную выбранные файлы (рекордеры уже загрузили сами)
      for (const p of picked) {
        const fd = new FormData()
        fd.append('file', p.file)
        fd.append('message_id', id)
        const r = await fetch('/api/media/upload', { method: 'POST', body: fd, credentials: 'include' })
        const j = await r.json().catch(() => ({}))
        if (!r.ok || !j?.ok) throw new Error(j?.error || `Не удалось загрузить файл: ${p.file.name}`)
      }

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
      next.push({ file: f, id: crypto.randomUUID(), preview: URL.createObjectURL(f) })
    }
    setPicked(prev => [...prev, ...next])
    if (fileInput.current) fileInput.current.value = ''
  }

  function removePicked(id: string) {
    setPicked(prev => {
      const item = prev.find(p => p.id === id)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      return prev.filter(p => p.id !== id)
    })
  }

  const canSave =
    tab === 'text'
      ? content.trim().length > 0
      : (picked.length > 0 || !!messageId)

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
        <div className="card mt-3 grid gap-3">
          <div className="text-sm">Запишите голос или загрузите файл</div>
          {/* Наш продакшен-рекордер: сам пишет и грузит в /api/media/upload, если есть messageId */}
          <RecorderBase
            messageId={messageId ?? undefined}
            onUploaded={() => {/* можно обновить список файлов, если появится UI */}}
          />
          <div className="flex flex-wrap gap-2">
            <button className="btn secondary" type="button" onClick={() => wantFiles('audio/*')}>Выбрать аудио</button>
          </div>
          {!messageId && <div className="text-sm opacity-70">Черновик создаётся автоматически при выборе этой вкладки…</div>}
        </div>
      )}

      {tab === 'video' && (
        <div className="card mt-3 grid gap-3">
          <div className="text-sm">Запишите видео или загрузите файл</div>
          <VideoRecorder
            messageId={messageId ?? undefined}
            onUploaded={() => {/* аналогично, при необходимости */}}
          />
          <div className="flex flex-wrap gap-2">
            <button className="btn secondary" type="button" onClick={() => wantFiles('video/*')}>Выбрать видео</button>
          </div>
          {!messageId && <div className="text-sm opacity-70">Черновик создаётся автоматически при выборе этой вкладки…</div>}
        </div>
      )}

      {tab === 'files' && (
        <div className="card mt-3 grid gap-2">
          <div className="text-sm">Прикрепите файлы</div>
          <div className="flex gap-2">
            <button className="btn secondary" type="button" onClick={() => wantFiles('*/*')}>Выбрать файлы</button>
          </div>
          {!messageId && <div className="text-sm opacity-70">Черновик создаётся автоматически при выборе этой вкладки…</div>}
        </div>
      )}

      {/* Список выбранных (ручной выбор через input). Рекордеры сюда не добавляют, они сразу грузят. */}
      {picked.length > 0 && (
        <div className="card mt-3">
          <div className="text-sm font-medium">Будут прикреплены (после нажатия «Сохранить»):</div>
          <ul className="mt-2 text-sm divide-y">
            {picked.map(p => (
              <li key={p.id} className="py-2 grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">{p.file.name} {p.file.size ? `· ${humanBytes(p.file.size)}` : ''}</span>
                  <button className="btn secondary" type="button" onClick={() => removePicked(p.id)}>Удалить</button>
                </div>
                {p.preview && p.file.type.startsWith('audio') && (
                  <audio controls src={p.preview} className="w-full" />
                )}
                {p.preview && p.file.type.startsWith('video') && (
                  <video controls src={p.preview} className="w-full rounded-xl bg-black/5" />
                )}
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
            <input type="radio" name="mode" checked={mode === 'heartbeat'} onChange={() => setMode('heartbeat')} />
            По пульсу (Dead-man switch)
          </label>
        </div>
        <div className="grid gap-2">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="mode" checked={mode === 'date'} onChange={() => setMode('date')} />
            По дате
          </label>
        </div>

        {mode === 'date' && (
          <div className="grid gap-2">
            <label className="text-sm">Дата и время доставки</label>
            <input className="border rounded-xl px-3 py-2" type="datetime-local" value={deliverAt} onChange={(e) => setDeliverAt(e.target.value)} />
          </div>
        )}

        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="btn primary mt-2" onClick={onSave} disabled={busy || !canSave}>
          {busy ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </div>

      {/* Скрытый input */}
      <input ref={fileInput} type="file" className="hidden" multiple onChange={(e) => onPicked(e.target.files)} />
    </div>
  )
}
