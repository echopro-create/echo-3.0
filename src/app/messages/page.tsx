import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import Link from "next/link";
import { deleteMessage } from "./actions";
import { StatusBadge } from "@/components/messages/status-badge";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  kind: "text" | "voice" | "video" | "file";
  trigger_kind: "datetime" | "event" | "afterlife";
  send_at: string | null;
  status: "draft" | "scheduled" | "sent" | "canceled";
  created_at: string;
  updated_at: string;
};

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

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rows, error } = await supabase
    .from("messages")
    .select("id, kind, trigger_kind, send_at, status, created_at, updated_at")
    .order("created_at", { ascending: false })
    .returns<Row[]>();

  if (error) {
    throw new Error(`Не удалось загрузить послания: ${error.message}`);
  }

  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
            Мои послания
          </h1>
          <Link
            href="/messages/new"
            className="inline-flex items-center rounded-lg border border-black/10 bg-black px-4 py-2 text-sm text-white transition hover:bg-black/90"
          >
            Создать послание
          </Link>
        </div>

        {!rows || rows.length === 0 ? (
          <section className="mt-8 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-[color:var(--muted)]">
              Пока пусто. Создайте первое послание — текст, голос, видео или файл.
            </p>
            <div className="mt-6">
              <Link
                href="/messages/new"
                className="inline-flex items-center rounded-lg border border-black/10 bg-black px-4 py-2 text-sm text-white transition hover:bg-black/90"
              >
                Новое послание
              </Link>
            </div>
          </section>
        ) : (
          <section className="mt-8 overflow-hidden rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5">
            <div className="relative w-full overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-black/[0.03] text-[color:var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">Формат</th>
                    <th className="px-4 py-3 text-left font-medium">Триггер</th>
                    <th className="px-4 py-3 text-left font-medium">Отправка</th>
                    <th className="px-4 py-3 text-left font-medium">Статус</th>
                    <th className="px-4 py-3 text-right font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-black/10 align-top">
                      <td className="px-4 py-3 font-mono text-xs text-[color:var(--muted)]">
                        {r.id}
                      </td>
                      <td className="px-4 py-3">
                        {r.kind === "text"
                          ? "Текст"
                          : r.kind === "voice"
                          ? "Голос"
                          : r.kind === "video"
                          ? "Видео"
                          : "Файл"}
                      </td>
                      <td className="px-4 py-3">
                        {r.trigger_kind === "datetime"
                          ? "По времени"
                          : r.trigger_kind === "event"
                          ? "По событию"
                          : "После моей смерти"}
                      </td>
                      <td className="px-4 py-3">{fmt(r.send_at)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/messages/${r.id}`}
                            className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs transition hover:bg-black/[0.03]"
                          >
                            Открыть
                          </Link>

                          <form action={deleteMessage}>
                            <input type="hidden" name="id" value={r.id} />
                            <button
                              type="submit"
                              className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs text-red-700 transition hover:bg-red-50"
                              title="Удалить послание"
                              aria-label="Удалить послание"
                            >
                              Удалить
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-black/10 px-4 py-3 text-xs text-[color:var(--muted)]">
              Всего: {rows.length}. Самые свежие сверху. Не благодарите.
            </div>
          </section>
        )}
      </main>
    </>
  );
}
