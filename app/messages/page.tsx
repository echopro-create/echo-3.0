export const metadata = { title: "Послания — ECHO" };

import { createSupabaseServerClient } from "@/lib/supabase.server";

type Message = {
  id: string
  kind: 'text' | 'audio' | 'video' | 'files'
  content: string | null
  delivery_mode: 'heartbeat' | 'date'
  deliver_at: string | null
  created_at: string
  files_count?: number
}

export default async function MessagesPage() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('messages')
    .select('id, kind, content, delivery_mode, deliver_at, created_at, message_files(count)')
    .order('created_at', { ascending: false })
    .limit(50)

  const items: Message[] = (data ?? []).map((row: any) => ({
    ...row,
    files_count: Array.isArray(row.message_files) && row.message_files.length > 0
      ? (row.message_files[0] as any).count as number
      : 0
  }))

  return (
    <div className="container py-6 grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="title text-2xl font-semibold">Послания</h1>
        <a className="btn primary" href="/messages/new">Создать</a>
      </div>

      {error && (
        <div className="card text-red-600">
          Ошибка загрузки: {error.message}
        </div>
      )}

      <div className="grid gap-3">
        {items.length === 0 ? (
          <div className="card">Пока пусто. Создайте первое послание.</div>
        ) : (
          items.map(m => (
            <a key={m.id} className="card block hover:shadow-sm transition-shadow" href={`/messages/${m.id}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm opacity-70">
                  {new Date(m.created_at).toLocaleString('ru-RU')}
                </div>
                <div className="text-xs uppercase opacity-70">
                  {m.kind === 'text' ? 'Текст' :
                   m.kind === 'audio' ? 'Голос' :
                   m.kind === 'video' ? 'Видео' : 'Файлы'}
                </div>
              </div>

              {m.content && m.kind === 'text' ? (
                <div className="mt-2 line-clamp-3 whitespace-pre-wrap">{m.content}</div>
              ) : (
                <div className="mt-2 text-[var(--mute)]">
                  {m.files_count ? `Вложений: ${m.files_count}` : 'Без предпросмотра'}
                </div>
              )}

              <div className="mt-3 text-sm">
                Доставка: {m.delivery_mode === 'heartbeat' ? 'по пульсу' : `по дате${m.deliver_at ? ` — ${new Date(m.deliver_at).toLocaleString('ru-RU')}` : ''}`}
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}
