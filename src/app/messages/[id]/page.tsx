import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { StatusBadge } from "@/components/messages/status-badge";
import { cancelMessage, rescheduleMessage } from "./actions";

export const dynamic = "force-dynamic";

type MessageRow = {
  id: string;
  user_id: string;
  kind: "text" | "voice" | "video" | "file";
  body_text: string | null;
  trigger_kind: "datetime" | "event" | "afterlife";
  send_at: string | null;
  event_code: string | null;
  afterlife_ack: boolean | null;
  status: "draft" | "scheduled" | "sent" | "canceled";
  created_at: string;
  updated_at: string;
};

type RecipientRow = { email: string };
type AttachmentRow = { path: string; mime: string | null; bytes: number };

const fmtRu = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function fmt(dt: string | null) {
  if (!dt) return "—";
  try {
    return fmtRu.format(new Date(dt));
  } catch {
    return dt;
  }
}

export default async function MessageViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Грузим саму запись
  const { data: msg, error: mErr } = await supabase
    .from("messages")
    .select(
      "id, user_id, kind, body_text, trigger_kind, send_at, event_code, afterlife_ack, status, created_at, updated_at",
    )
    .eq("id", id)
    .limit(1)
    .maybeSingle<MessageRow>();

  if (mErr) {
    throw new Error(`Не удалось загрузить послание: ${mErr.message}`);
  }
  if (!msg) {
    redirect("/messages");
  }
  if (msg.user_id !== user.id) {
    // RLS и так не отдаст, но на всякий случай
    redirect("/messages");
  }

  // Получатели
  const { data: recips } = await supabase
    .from("message_recipients")
    .select("email")
    .eq("message_id", id)
    .returns<RecipientRow[]>();

  // Вложения
  const { data: atts } = await supabase
    .from("attachments")
    .select("path,mime,bytes")
    .eq("message_id", id)
    .returns<AttachmentRow[]>();

  // Генерим краткоживущие ссылки на скачивание (если есть вложения)
  // Пути в БД полного вида: attachments/{user_id}/{message_id}/filename
  // В бакет отправляем без "attachments/".
  const signed: Array<{ name: string; url: string; bytes: number }> = [];
  if (atts && atts.length > 0) {
    for (const a of atts.slice(0, 10)) {
      const relPath = a.path.replace(/^attachments\//, "");
      const signedRes = await supabase.storage
        .from("attachments")
        .createSignedUrl(relPath, 600); // 10 минут
      if (signedRes.data?.signedUrl) {
        const name = relPath.split("/").slice(-1)[0] || "file";
        signed.push({
          name,
          url: signedRes.data.signedUrl,
          bytes: Number(a.bytes || 0),
        });
      }
    }
  }

  const canReschedule =
    msg.trigger_kind === "datetime" &&
    msg.status === "scheduled" &&
    msg.send_at !== null;

  const canCancel = msg.status === "scheduled";

  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
            Послание
          </h1>
          <Link
            href="/messages"
            className="inline-flex items-center rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm transition hover:bg-black/[0.03]"
          >
            ← К списку
          </Link>
        </div>

        {/* Шапка с метаданными */}
        <section className="mt-6 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5">
          <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[color:var(--muted)]">ID</dt>
              <dd className="mt-1 font-mono text-xs text-[color:var(--muted)]">
                {msg.id}
              </dd>
            </div>
            <div>
              <dt className="text-[color:var(--muted)]">Статус</dt>
              <dd className="mt-1">
                <StatusBadge status={msg.status} />
              </dd>
            </div>
            <div>
              <dt className="text-[color:var(--muted)]">Формат</dt>
              <dd className="mt-1 text-[color:var(--fg)]">
                {msg.kind === "text"
                  ? "Текст"
                  : msg.kind === "voice"
                    ? "Голос"
                    : msg.kind === "video"
                      ? "Видео"
                      : "Файл"}
              </dd>
            </div>
            <div>
              <dt className="text-[color:var(--muted)]">Триггер</dt>
              <dd className="mt-1 text-[color:var(--fg)]">
                {msg.trigger_kind === "datetime"
                  ? "По времени"
                  : msg.trigger_kind === "event"
                    ? "По событию"
                    : "После моей смерти"}
              </dd>
            </div>

            <div>
              <dt className="text-[color:var(--muted)]">Отправка</dt>
              <dd className="mt-1 text-[color:var(--fg)]">
                {fmt(msg.send_at)}
              </dd>
            </div>

            {msg.trigger_kind === "event" && (
              <div>
                <dt className="text-[color:var(--muted)]">Событие/код</dt>
                <dd className="mt-1 text-[color:var(--fg)]">
                  {msg.event_code || "—"}
                </dd>
              </div>
            )}

            {msg.trigger_kind === "afterlife" && (
              <div>
                <dt className="text-[color:var(--muted)]">Подтверждение</dt>
                <dd className="mt-1 text-[color:var(--fg)]">
                  {msg.afterlife_ack ? "Получено" : "—"}
                </dd>
              </div>
            )}

            <div className="md:col-span-2">
              <dt className="text-[color:var(--muted)]">Получатели</dt>
              <dd className="mt-1 text-[color:var(--fg)]">
                {recips && recips.length > 0
                  ? recips.map((r) => r.email).join(", ")
                  : "—"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Контент */}
        <section className="mt-6 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="text-base font-semibold text-[color:var(--fg)]">
            Содержимое
          </h2>
          {msg.kind === "text" ? (
            <div className="mt-3 whitespace-pre-wrap rounded-lg border border-black/10 bg-black/[0.03] p-3 text-sm">
              {msg.body_text || "—"}
            </div>
          ) : signed.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {signed.map((f, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <div className="truncate">
                    <span className="font-medium">{f.name}</span>{" "}
                    <span className="text-[color:var(--muted)]">
                      ({(f.bytes / (1024 * 1024)).toFixed(1)} МБ)
                    </span>
                  </div>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs transition hover:bg-black/[0.03]"
                  >
                    Скачать
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              Вложений нет.
            </p>
          )}
        </section>

        {/* Действия: перепланировать / отменить */}
        <section className="mt-6 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="text-base font-semibold text-[color:var(--fg)]">
            Действия
          </h2>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            {canReschedule && (
              <form action={rescheduleMessage} className="flex items-end gap-2">
                <input type="hidden" name="id" value={msg.id} />
                <label className="text-sm">
                  <span className="block text-[color:var(--muted)]">
                    Новая дата и время
                  </span>
                  <input
                    type="datetime-local"
                    name="send_at"
                    required
                    className="mt-1 w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-sm outline-none focus:border-black/20"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-lg border border-black/10 bg-black px-3 py-2 text-sm text-white transition hover:bg-black/90"
                >
                  Перепланировать
                </button>
              </form>
            )}

            {canCancel && (
              <form action={cancelMessage}>
                <input type="hidden" name="id" value={msg.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-red-700 transition hover:bg-red-50"
                  title="Отменить отправку"
                >
                  Отменить
                </button>
              </form>
            )}
          </div>

          {!canReschedule && !canCancel && (
            <p className="text-sm text-[color:var(--muted)] mt-2">
              Для «черновиков» и «отправленных» действий нет. Что сделано, то
              сделано.
            </p>
          )}
        </section>
      </main>
    </>
  );
}
