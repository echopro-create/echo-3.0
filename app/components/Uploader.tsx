// app/components/Uploader.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export default function Uploader() {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true); setErr(null); setNote(null)

    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      if (!token) throw new Error('Нет сессии')

      // 1) создаём подписанный URL на загрузку
      const res1 = await fetch('/api/uploads/create-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      })
      const u = await res1.json()
      if (!res1.ok) throw new Error(u?.error || 'Не удалось подготовить загрузку')

      // 2) грузим сам файл
      const put = await fetch(u.url, {
        method: 'PUT',
        headers: { 'Content-Type': u.contentType || file.type || 'application/octet-stream' },
        body: file
      })
      if (!put.ok) throw new Error('Ошибка при загрузке файла')

      // 3) создаём сообщение с вложением
      const res2 = await fetch('/api/messages/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          kind: 'file',
          attachments: [{ path: u.path, mime_type: file.type, size_bytes: file.size }]
        })
      })
      const m = await res2.json()
      if (!res2.ok) throw new Error(m?.error || 'Не удалось создать запись')

      setNote('Файл загружен. Сообщение создано.')
    } catch (e: any) {
      setErr(e?.message || 'Сбой загрузки')
    } finally {
      setBusy(false)
      e.currentTarget.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm text-neutral-700">Загрузить файл</label>
      <input
        type="file"
        onChange={handlePick}
        disabled={busy}
        className="block w-full text-sm"
      />
      {note && <p className="text-green-700 text-sm">{note}</p>}
      {err && <p className="text-red-600 text-sm">{err}</p>}
    </div>
  )
}
