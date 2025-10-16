import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Attachment = { path: string; name: string; size: number; type: string };

type Row = {
  id: string;
  title: string | null;
  status: "draft" | "scheduled" | "sent";
  mode: "date" | "event" | "pulse";
  deliver_at: string | null; // ISO
  created_at: string | null;
  content: { attachments?: Attachment[] } | null;
};

function statusLabel(s: Row["status"]) {
  switch (s) {
    case "draft":
      return "Черновик";
    case "scheduled":
      return "Запланировано";
    case "sent":
      return "Отправлено";
  }
}

function modeLabel(m: Row["mode"]) {
  switch (m) {
    case "date":
      return "По дате";
    case "event":
      return "По событию";
    case "pulse":
      return "По «пульсу»";
  }
}

function fmtUTC(iso: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return (
      new Intl.DateTimeFormat("ru-RU", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        hour12: false,
      }).format(d) + " UTC"
    );
  } catch {
    return iso;
  }
}

function fmtSize(bytes: number) {
  if (!Number.isFinite(bytes)) return "—";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

export default async function MessageViewPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("messages")
    .select("id, title, status, mode, deliver_at, created_at, content")
    .eq("id", id)
    .maybeSingle<Row>();

  if (error) notFound();
  if (!data) notFound();

  const title = data.title?.trim() || "Без названия";
  const attachments = data.content?.attachments ?? [];

  // Подписываем URL для скачивания (час жизни, хватит всем, даже перфекционистам)
  const signed: Array<Attachment & { url: string | null }> = [];
  for (const att of attachments) {
    const { data: signedUrl, error: signErr } = await supabase.storage
      .from("attachments")
      .createSignedUrl(att.path, 60 * 60);
    signed.push({ ...att, url: signErr ? null : signedUrl?.signedUrl ?? null });
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      {/* Заголовок + статус */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="break-words text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm opacity-70">#{data.id}</p>
        </div>
        <span
          className="inline-flex items-center rounded-full px-2 py-1 text-[11px] uppercase tracking-wider ring-1 ring-[color:var(--fg)]/20 opacity-80"
          aria-label={`Статус: ${statusLabel(data.status)}`}
        >
          {statusLabel(data.status)}
        </span>
      </div>

      {/* Карточка свойств */}
      <section className="rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm">
        <dl className="grid gap-4">
          <div className="grid grid-cols-3 items-baseline gap-3">
            <dt className="text-sm opacity-70">Создано</dt>
            <dd className="col-span-2 text-sm">{fmtUTC(data.created_at)}</dd>
          </div>

          <div className="grid grid-cols-3 items-baseline gap-3">
            <dt className="text-sm opacity-70">Режим доставки</dt>
            <dd className="col-span-2 text-sm">{modeLabel(data.mode)}</dd>
          </div>

          <div className="grid grid-cols-3 items-baseline gap-3">
            <dt className="text-sm opacity-70">Доставить</dt>
            <dd className="col-span-2 text-sm">{fmtUTC(data.deliver_at)}</dd>
          </div>
        </dl>

        {/* Вложенные файлы */}
        <div className="mt-5 h-px w-full bg-[var(--ring)]" />
        <div className="mt-4">
          <h3 className="mb-2 text-base font-medium">Вложения</h3>
          {signed.length === 0 ? (
            <p className="text-sm opacity-70">Нет вложений.</p>
          ) : (
            <ul className="space-y-2">
              {signed.map((f) => (
                <li
                  key={f.path}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--ring)] px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate">{f.name}</div>
                    <div className="text-xs opacity-60">
                      {f.type || "application/octet-stream"} · {fmtSize(f.size)}
                    </div>
                  </div>
                  {f.url ? (
                    <a
                      href={f.url}
                      download
                      className="inline-flex h-9 items-center rounded-lg px-3 text-xs font-medium ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      Скачать
                    </a>
                  ) : (
                    <span className="text-xs text-red-600">Нет доступа</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5 h-px w-full bg-[var(--ring)]" />

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/messages/${data.id}/edit`}
            className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Редактировать
          </Link>
          <Link
            href="/messages"
            className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium underline underline-offset-4 opacity-90 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            ← Вернуться к списку
          </Link>
        </div>
      </section>
    </main>
  );
}
