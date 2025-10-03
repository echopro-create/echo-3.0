// app/messages/[id]/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type FileRow = {
  id: string;
  path: string | null; // важное: может быть null в БД
  mime: string | null;
  bytes: number | null;
};

type SignedView = {
  id: string;
  url: string | null;
  mime: string | null;
  bytes: number | null;
  name: string;
  err?: string | null;
};

export default async function MessageDetail(props: any) {
  const id = String(props?.params?.id || "");
  if (!id) {
    return (
      <div className="container py-6">
        <div className="card text-red-600">Некорректный адрес.</div>
        <a className="btn secondary mt-3" href="/messages">К списку</a>
      </div>
    );
  }

  try {
    const supabase = await createSupabaseServerClient();

    // 1) Аутентификация
    const { data: au, error: auErr } = await supabase.auth.getUser();
    if (auErr) {
      console.error("[message detail] auth.getUser error:", auErr);
      return fail("Ошибка авторизации: " + auErr.message);
    }
    if (!au?.user) {
      return (
        <div className="container py-6">
          <div className="card text-red-600">Нужна авторизация.</div>
          <a className="btn primary mt-3" href="/login">Войти</a>
        </div>
      );
    }

    // 2) Сообщение
    const { data: msg, error: msgErr } = await supabase
      .from("messages")
      .select("id, user_id, kind, content, delivery_mode, deliver_at, created_at")
      .eq("id", id)
      .single();

    if (msgErr) {
      console.error("[message detail] select messages error:", msgErr);
      return fail("Ошибка загрузки послания: " + msgErr.message);
    }
    if (!msg || msg.user_id !== au.user.id) {
      return (
        <div className="container py-6">
          <div className="card text-red-600">Послание не найдено или нет доступа.</div>
          <a className="btn secondary mt-3" href="/messages">К списку</a>
        </div>
      );
    }

    // 3) Вложения
    const { data: files, error: filesErr } = await supabase
      .from("message_files")
      .select("id, path, mime, bytes")
      .eq("message_id", id)
      .order("id", { ascending: true });

    if (filesErr) {
      console.error("[message detail] select message_files error:", filesErr);
    }

    // 4) Подписанные ссылки (10 минут), НИКОГДА не падаем из-за storage
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
        mime: f.mime ?? null,
        bytes: f.bytes ?? null,
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

        {msg.content && <div className="card whitespace-pre-wrap">{msg.content}</div>}

        {signed.length > 0 && (
          <div className="card grid gap-3">
            <div className="font-medium">Вложения</div>
            <ul className="grid gap-3">
              {signed.map((f) => (
                <li key={f.id} className="grid gap-2">
                  <div className="text-sm">
                    {f.name} {f.bytes ? `· ${(f.bytes / 1024 / 1024).toFixed(2)} MB` : ""}
                  </div>
                  {f.url && f.mime?.startsWith("audio") && <audio controls src={f.url} className="w-full" />}
                  {f.url && f.mime?.startsWith("video") && <video controls src={f.url} className="w-full rounded-xl bg-black/5" />}
                  {f.url && !f.mime?.startsWith("audio") && !f.mime?.startsWith("video") && (
                    <a className="btn secondary w-fit" href={f.url} target="_blank" rel="noreferrer">Скачать</a>
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
      </div>
    );
  } catch (e: any) {
    console.error("[message detail] fatal error:", e);
    return fail(String(e?.message || e));
  }
}

function fail(text: string) {
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

function labelKind(k: string) {
  return k === "text" ? "Текст" : k === "audio" ? "Голос" : k === "video" ? "Видео" : "Файлы";
}
