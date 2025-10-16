import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  title: string | null;
  status: "draft" | "scheduled" | "sent";
  mode: "date" | "event" | "pulse";
  deliver_at: string | null; // ISO
  created_at: string | null;
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
    // Чётко обозначаем UTC, чтобы без сюрпризов
    return new Intl.DateTimeFormat("ru-RU", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      hour12: false,
    }).format(d) + " UTC";
  } catch {
    return iso;
  }
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
    .select("id, title, status, mode, deliver_at, created_at")
    .eq("id", id)
    .maybeSingle<Row>();

  if (error) {
    // Если БД плюнула ошибкой — не позоримся словами, отдаём 404
    notFound();
  }
  if (!data) {
    notFound();
  }

  const title = data.title?.trim() || "Без названия";

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      {/* Заголовок + статус */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight break-words">{title}</h1>
          <p className="mt-1 text-sm opacity-70">#{data.id}</p>
        </div>
        <span
          className="inline-flex items-center rounded-full px-2 py-1 text-[11px] uppercase tracking-wider
                     ring-1 ring-[color:var(--fg)]/20 opacity-80"
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
            <dd className="col-span-2 text-sm">
              {fmtUTC(data.created_at)}
            </dd>
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

        <div className="mt-5 h-px w-full bg-[var(--ring)]" />

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/messages/${data.id}/edit`}
            className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium
                       ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Редактировать
          </Link>
          <Link
            href="/messages"
            className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium
                       underline underline-offset-4 opacity-90 hover:opacity-100
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            ← Вернуться к списку
          </Link>
        </div>
      </section>
    </main>
  );
}
