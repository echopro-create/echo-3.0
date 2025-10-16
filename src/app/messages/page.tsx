import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Послания — Echo" };

type Row = {
  id: string;
  title: string;
  status: "draft" | "scheduled" | "sent";
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

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("messages")
    .select("id, title, status")
    .order("created_at", { ascending: false })
    .returns<Row[]>();

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Послания</h1>
        <p className="mt-4 text-sm text-red-600">Ошибка загрузки: {error.message}</p>
      </main>
    );
  }

  // Без расширения до any[]
  const list: Row[] = data ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Послания</h1>
          <p className="opacity-80">Черновики, запланированные и отправленные.</p>
        </div>
        <Link
          href="/messages/new"
          className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium
                     bg-[color:var(--fg)] text-[color:var(--bg)]
                     hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Новое послание
        </Link>
      </div>

      {list.length === 0 ? (
        <section
          aria-labelledby="empty-title"
          className="rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-6"
        >
          <h2 id="empty-title" className="text-lg font-medium">
            Пока пусто
          </h2>
          <p className="mt-1 opacity-80">
            Создайте первое послание: добавите текст, голос или видео, выберете способ доставки.
          </p>
          <div className="mt-4">
            <Link
              href="/messages/new"
              className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium
                         ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Создать черновик
            </Link>
          </div>
        </section>
      ) : (
        <div role="list" className="grid gap-4 md:grid-cols-3">
          {list.map((m: Row) => (
            <article
              role="listitem"
              key={m.id}
              className="rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-xs opacity-60" aria-label={`Идентификатор ${m.id}`}>
                  #{m.id.slice(0, 8)}
                </div>
                <span
                  className="inline-flex items-center rounded-full px-2 py-1 text-[11px] uppercase tracking-wider
                             ring-1 ring-[color:var(--fg)]/20 opacity-80"
                >
                  {statusLabel(m.status)}
                </span>
              </div>

              <h2 className="mb-1 break-words text-lg font-medium">{m.title || "Без названия"}</h2>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/messages/${m.id}`}
                  className="rounded-lg px-1 text-sm underline opacity-90 hover:opacity-100
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Открыть
                </Link>
                <Link
                  href={`/messages/${m.id}/edit`}
                  className="rounded-lg px-1 text-sm underline opacity-90 hover:opacity-100
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Редактировать
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
