import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Послания — Echo" };

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

      <div className="rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm opacity-80">
        Здесь появится список ваших посланий после подключения таблиц и RLS.
      </div>
    </main>
  );
}
