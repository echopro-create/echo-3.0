// app/messages/[id]/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type FileRow = {
  id: string;
  path: string | null;
  mime: string | null;
  bytes: number | null;
  created_at: string | null;
};

type SignedView = {
  id: string;
  url: string | null;
  mime: string | null;
  bytes: number | null;
  name: string;
  created_at: string | null;
  err?: string | null;
};

export default async function MessageDetail(props: any) {
  const id = String(props?.params?.id || "");
  if (!id) return bad("Некорректный адрес.");

  try {
    const supabase = await createSupabaseServerClient();

    // 1) Аутентификация
    const { data: au, error: auErr } = await supabase.auth.getUser();
    if (auErr) return bad("Ошибка авторизации: " + auErr.message);
    if (!au?.user) {
      return (
        <div className="container py-6">
          <div className="card text-red-600">Нужна авторизация.</div>
          <a className="btn primary mt-3" href="/login">Войти</a>
        </div>
      );
    }

    // 2) Сообщение (строго владельцу)
    const { data: msg, error: msgErr } = await supabase
      .from("messages")
      .select("id, user_id, kind, content, delivery_mode, deliver_at, created_at")
      .eq("id", id)
      .single();

    if (msgErr) return bad("Ошибка загрузки послания: " + msgErr.message);
    if (!msg || msg.user_id !== au.user.id) {
      return (
        <div className="container py-6">
          <div className="card text-red-600">Послание не найдено или нет доступа.</div>
          <a className="btn secondary mt-3" href="/messages">К списку</a>
        </div>
      );
    }

    // 3) Вложения, сортируем по message_files.created_at (если колонки не будет — у тебя уже есть)
    const { data: files, error: filesErr } = await supabase
      .from("message_files")
      .select("id, path, mime, bytes, created_at")
      .eq("message_id", id)
      .order("created_at", { ascending: true });

    if (filesErr) {
      // Не роняем страницу из-за бага стораджа
      console.error("[message detail] select message_files error:", filesErr);
    }

    // 4) Подписанные ссылки (TTL 10 минут). Не падаем из-за отдельных фейлов.
    const signed: SignedView[] = [];
    for (const f of (files || []) as FileRow[]) {
      const rawPath = f?.path ?? null;
      const name = rawPath?.split("/").pop() || rawPath || "file";
      let url: string | null = null;
      let err: string | null = null;

      if (rawPath && typeof rawPath === "string" && rawPath.trim().length > 0) {
        try {
          const { data: s, error: sErr } = await supabase.storage
            .from("attachments")
            .createSignedUrl(rawPath, 600);
          if (sErr) {
            console.error("[message detail] signed url error:", sErr, "path:", rawPath);
            err = sErr.message ?? "signed url error";
          } else {
            url = s?.signedUrl ?? null;
          }
        } catch (e: any) {
          console.error("[message detail] signed url throw:", e, "path:", rawPath);
          err = String(e?.message || e);
        }
      } else {
        err = "empty path";
      }

      signed.push({
        id: f.id,
        url,
        mime: (f.mime ?? "") || null,
        bytes: f.bytes ?? null,
        created_at: f.created_at ?? null,
        name,
        err,
      });
    }

    return (
      <div className="container py-6 grid gap-4" style={{ maxWidth: 860 }}>
        <div className="flex items-center justify-between gap-3">
          <h1 className="title text-2xl font-semibold">Послание</h1>
          <div className="flex gap-2">
            <a className="btn secondary" href="/messages">Назад</a>
            <a className="btn" href={`/messages/${id}/edit`}>Редактировать</a>
            <form action={`/api/messages/${id}`} method="post">
              {/* HTML-форма не умеет DELETE — прокидываем через _method */}
              <input type="hidden" name="_method" value="DELETE" />
              <button className="btn danger" type="submit">Удалить</button>
            </form>
          </div>
        </div>

        <div className="card grid gap-2">
          <div className="text-sm opacity-70">Создано: {safeDate(msg.created_at)}</div>
          <div className="text-sm">Тип: {labelKind(msg.kind)}</div>
          <div className="text-sm">
            Доставка: {msg.delivery_mode === "heartbeat"
              ? "по пульсу"
              : `по дате${msg.deliver_at ? ` — ${safeDate(msg.deliver_at)}` : ""}`}
          </div>
        </div>

        {msg.content && (
          <div className="card whitespace-pre-wrap">{msg.content}</div>
        )}

        {signed.length > 0 && (
          <div className="card grid gap-3">
            <div className="font-medium">Вложения</div>
            <ul className="grid gap-4">
              {signed.map((f) => (
                <li key={f.id} className="grid gap-2">
                  <div className="text-sm flex items-center justify-between gap-3">
                    <span className="truncate">
                      {f.name}
                      {f.bytes ? ` · ${humanBytes(f.bytes)}` : ""}
                      {f.created_at ? ` · ${safeDate(f.created_at)}` : ""}
                    </span>
                    {/* Фолбэк: ссылка СКАЧАТЬ, если предпросмотр невозможен */}
                    {f.url && !canInlinePreview(f.mime) && (
                      <a className="btn secondary" href={f.url} target="_blank" rel="noreferrer">Скачать</a>
                    )}
                  </div>

                  {/* Инлайн-просмотр в приоритете */}
                  {f.url && f.mime?.startsWith("audio") && (
                    <audio controls src={f.url} className="w-full" />
                  )}
                  {f.url && f.mime?.startsWith("video") && (
                    <video controls src={f.url} className="w-full rounded-xl bg-black/5" />
                  )}
                  {f.url && f.mime?.startsWith("image/") && (
                    <img src={f.url} alt={f.name} className="max-w-full rounded-xl border" />
                  )}
                  {f.url && f.mime === "application/pdf" && (
                    <iframe
                      src={f.url}
                      className="w-full rounded-xl"
                      style={{ minHeight: 420, background: "#fafafa", border: "1px solid #eee" }}
                    />
                  )}

                  {!f.url && (
                    <div className="text-xs text-red-600">
                      Не удалось создать ссылку на файл: {f.name}{f.err ? ` · ${f.err}` : ""}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {signed.length === 0 && !msg.content && (
          <div className="card text-sm opacity-70">Содержимого нет.</div>
        )}
      </div>
    );
  } catch (e: any) {
    console.error("[message detail] fatal error:", e);
    return bad(String(e?.message || e));
  }
}

/* ───────────────────────── helpers ───────────────────────── */

function bad(text: string) {
  return (
    <div className="container py-6">
      <div className="card text-red-600">
        Не удалось отобразить послание.
        <div className="mt-2 text-xs opacity-70">{text}</div>
      </div>
      <a className="btn secondary mt-3" href="/messages">К списку</a>
    </div>
  );
}

function safeDate(s: string | null) {
  if (!s) return "—";
  const t = new Date(s);
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleString("ru-RU");
}

function humanBytes(n?: number | null) {
  if (!n || n <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0; let x = n;
  while (x >= 1024 && i < units.length - 1) { x /= 1024; i++; }
  return `${x.toFixed(1)} ${units[i]}`;
}

function labelKind(k: string) {
  return k === "text" ? "Текст" : k === "audio" ? "Голос" : k === "video" ? "Видео" : "Файлы";
}

function canInlinePreview(m?: string | null) {
  if (!m) return false;
  return m.startsWith("audio") || m.startsWith("video") || m.startsWith("image/") || m === "application/pdf";
}
