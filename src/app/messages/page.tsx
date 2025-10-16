import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Послания — Echo" };

type Row = {
  id: string;
  title: string;
  status: "draft" | "scheduled" | "sent";
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Послания</h1>
          <p className="opacity-80">Черновики, запланированные и отправленные.</p>
        </div>
        <Link
          href="/messages/new"
          className="rounded-xl border border-[var(--ring)] px-4 py-2 text-sm hover:opacity-100 opacity-90"
        >
          Новое послание
        </Link>
      </div>

      {(!data || data.length === 0) ? (
        <div className="rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-6 opacity-80">
          Пока пусто. Нажмите «Новое послание», чтобы создать черновик.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {data.map((m) => (
            <article
              key={m.id}
              className="rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm"
            >
              <div className="mb-2 text-xs opacity-60">#{m.id.slice(0, 8)}</div>
              <h2 className="mb-1 text-lg font-medium">{m.title}</h2>
              <div className="text-sm opacity-80">
                Статус: <span className="uppercase tracking-wide">{m.status}</span>
              </div>
              <div className="mt-4 flex gap-3">
                <Link href={`/messages/${m.id}`} className="text-sm underline opacity-90 hover:opacity-100">
                  Открыть
                </Link>
                <Link href={`/messages/${m.id}/edit`} className="text-sm underline opacity-90 hover:opacity-100">
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
