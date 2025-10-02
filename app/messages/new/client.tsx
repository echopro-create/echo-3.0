'use client'
import { useEffect, useRef, useState } from 'react'

type Kind = 'text' | 'audio' | 'video' | 'files'
type Mode = 'heartbeat' | 'date'

type Picked = { file: File, id: string, preview?: string }

export default function NewMessageClient() {
  const [tab, setTab] = useState<Kind>('text')
  const [mode, setMode] = useState<Mode>('heartbeat')
  const [content, setContent] = useState('')              // текст послания
  const [deliverAt, setDeliverAt] = useState('')          // datetime-local
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [picked, setPicked] = useState<Picked[]>([])      // выбранные/записанные файлы
  const fileInput = useRef<HTMLInputElement | null>(null)

  // --- Рекордер ---
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const videoEl = useRef<HTMLVideoElement | null>(null)
  const [recState, setRecState] = useState<'idle'|'recording'|'stopped'>('idle')
  const [recErr, setRecErr] = useState<string | null>(null)

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
      const payload: any = { kind: tab, delivery_mode: mode }
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

      // 2) грузим все выбранные/записанные файлы с привязкой
      for (const p of picked) {
        const fd = new FormData()
        fd.append('file', p.file)
        fd.append('message_id', messageId)
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

  // --- Работа с камерой/микрофоном ---
  async function startRecording(kind: 'audio'|'video') {
    setRecErr(null)
    try {
      // запрашиваем доступ к устройствам
      const constraints: MediaStreamConstraints = kind === 'audio'
        ? { audio: true }
        : { audio: true, video: { facingMode: 'user' } }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      mediaStreamRef.current = stream

      // для видео показываем превью
      if (kind === 'video' && videoEl.current) {
        videoEl.current.srcObject = stream
        await videoEl.current.play().catch(() => {})
      }

      // подбираем поддерживаемый MIME
      const mimeCandidates = kind === 'audio'
        ? ['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg']
        : ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4']
      const mimeType = mimeCandidates.find(t => MediaRecorder.isTypeSupported(t)) || ''

      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorderRef.current = rec
      chunksRef.current = []

      rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || (kind==='audio'?'audio/webm':'video/webm') })
        const ext = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('ogg') ? 'ogg' : 'webm'
        const file = new File([blob], `${kind}-${Date.now()}.${ext}`, { type: blob.type })
        const preview = URL.createObjectURL(file)
        setPicked(prev => [...prev, { file, id: crypto.randomUUID(), preview }])
        // гасим поток
        stream.getTracks().forEach(t => t.stop())
        mediaStreamRef.current = null
        recorderRef.current = null
        setRecState('stopped')
      }

      rec.start()
      setRecState('recording')
    } catch (e: any) {
      setRecErr(e.message || 'Не удалось запустить запись. Разрешите доступ к микрофону/камере.')
      setRecState('idle')
    }
  }

  function stopRecording() {
    try {
      recorderRef.current?.stop()
    } catch {}
  }

  useEffect(() => {
    return () => {
      // на размонтировании выключаем всё
      recorderRef.current?.state === 'recording' && recorderRef.current.stop()
      mediaStreamRef.current?.getTracks().forEach(t => t.stop())
      picked.forEach(p => p.preview && URL.revokeObjectURL(p.preview))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          <div className="flex flex-wrap gap-2">
            {recState !== 'recording' ? (
              <button className="btn secondary" type="button" onClick={() => startRecording('audio')}>Начать запись</button>
            ) : (
              <button className="btn primary" type="button" onClick={stopRecording}>Остановить</button>
            )}
            <button className="btn secondary" type="button" onClick={() => wantFiles('audio/*')}>Выбрать аудио</button>
          </div>
          {recErr && <div className="text-red-600 text-sm">{recErr}</div>}
        </div>
      )}

      {tab === 'video' && (
        <div className="card mt-3 grid gap-3">
          <div className="text-sm">Запишите видео или загрузите файл</div>
          <div className="grid gap-2">
            <video ref={videoEl} className="w-full rounded-xl bg-black/5" playsInline muted />
            <div className="flex flex-wrap gap-2">
              {recState !== 'recording' ? (
                <button className="btn secondary" type="button" onClick={() => startRecording('video')}>Начать запись</button>
              ) : (
                <button className="btn primary" type="button" onClick={stopRecording}>Остановить</button>
              )}
              <button className="btn secondary" type="button" onClick={() => wantFiles('video/*')}>Выбрать видео</button>
            </div>
            {recErr && <div className="text-red-600 text-sm">{recErr}</div>}
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

      {/* Список выбранных/записанных */}
      {picked.length > 0 && (
        <div className="card mt-3">
          <div className="text-sm font-medium">Будут прикреплены:</div>
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
        <button className="btn primary mt-2" onClick={onSave} disabled={busy}>
          {busy ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </div>

      {/* Скрытый input */}
      <input ref={fileInput} type="file" className="hidden" multiple onChange={(e) => onPicked(e.target.files)} />
    </div>
  )
}
