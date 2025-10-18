import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { CTA } from "@/components/cta";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
          Мои послания
        </h1>
        <p className="mt-3 text-[color:var(--muted)]">
          Здесь будут ваши черновики, запланированные и отправленные послания.
        </p>

        {/* Пустое состояние */}
        <section className="mt-8 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-[color:var(--muted)]">
            Пока пусто. Создайте первое послание — текст, голос, видео или файл.
          </p>
          <div className="mt-6">
            <CTA />
          </div>
        </section>
      </main>
    </>
  );
}
