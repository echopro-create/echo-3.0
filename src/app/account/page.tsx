import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Аккаунт — Echo" };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Аккаунт</h1>
      <p className="mb-8 opacity-80">Настройки профиля, ключи шифрования и связка устройств.</p>

      <section className="rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-medium">Профиль</h2>
        <ul className="space-y-2 text-sm opacity-80">
          <li>Почта: <span className="opacity-90">{user.email}</span></li>
          <li>Идентификатор: <span className="opacity-90">{user.id}</span></li>
        </ul>
      </section>
    </main>
  );
}
