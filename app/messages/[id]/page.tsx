import { createSupabaseServerClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";

export default async function MessageDetail({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()

  // Получаем сообщение и вложения. RLS гарантирует доступ только владельцу.
  const { data: msg, error } = await supabase
    .from('messages')
    .select('id, kind, content, delivery_mode, deliver_at, created_at')
    .eq('id', params.id)
    .single()

  if (error || !msg) {
    return (
      <div className="container py-6">
        <div className="card text-red-600">Послание не найдено или нет доступа.</div>
      </div>
    )
  }

  const { data: files, error: ferr } = await supabase
    .from('message_files')
    .select('id, path, mime, bytes')
    .eq('message_id', params.id)
    .order('id', { ascending: true })

  // Для каждого файла создаём подписанную ссылку на 10 минут
  const signed: { id: string; url: string | null; mime: string | null; bytes: number | null; name: string }[] = []
  if (!ferr && files && files.length) {
    for (const f of files) {
      const name = f.path.split('/').pop() || f.path
      const { data: s } = await supabase.storage.from('attachments').createSignedUrl(f.path, 60 * 10)
      signed.push({ id: f.id, url: s?.signedUrl ?? null, mime: f.mime ?? null, bytes: f.bytes ?? null, name })
    }
  }

  return (
    <div className="container py-6 grid gap-4" style={{ maxWidth: 820 }}>
      <div className="flex items-center justify-between">
        <h1 className="title text-2xl font-semibold">Послание</h1>
        <a className="btn secondary" href="/messages">Назад</a>
      </div>

      <div className="card grid gap-2">
        <div className="text-sm opacity-70">
          Создано: {new Date(msg.created_at).toLocaleString('ru-RU')}
        </div>
        <div className="text-sm">
          Тип: {msg.kind === 'text' ? 'Текст' : msg.kind === 'audio' ? 'Голос' : msg.kind === 'video' ? 'Видео' : 'Файлы'}
        </div>
        <div className="text-sm">
          Доставка: {msg.delivery_mode === 'heartbeat' ? 'по пульсу' :
            `по дате${msg.deliver_at ? ` — ${new Date(msg.deliver_at).toLocaleString('ru-RU')}` : ''}`}
        </div>
      </div>

      {msg.content && (
        <div className="card whitespace-pre-wrap">{msg.content}</div>
      )}

      {signed.length > 0 && (
        <div className="card grid gap-3">
          <div className="font-medium">Вложения</div>
          <ul className="grid gap-3">
            {signed.map(f => (
              <li key={f.id} className="grid gap-2">
                <div className="text-sm">{f.name} {f.bytes ? `· ${(f.bytes/1024/1024).toFixed(2)} MB` : ''}</div>
                {f.url && f.mime?.startsWith('audio') && <audio controls src={f.url} className="w-full" />}
                {f.url && f.mime?.startsWith('video') && <video controls src={f.url} className="w-full rounded-xl bg-black/5" />}
                {f.url && !f.mime?.startsWith('audio') && !f.mime?.startsWith('video') && (
                  <a className="btn secondary w-fit" href={f.url} target="_blank" rel="noreferrer">Скачать</a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
