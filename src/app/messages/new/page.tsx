import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import NewMessageForm from "@/components/messages/new-form";

export const dynamic = "force-dynamic";

export default async function NewMessagePage() {
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
      <main
        id="main"
        className="mx-auto max-w-3xl px-4 py-12"
        role="main"
        aria-label="Создание послания"
      >
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
            Новое послание
          </h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Текст, голос, видео или файлы. Выберите триггер и получателей. Всё
            по-честному и по расписанию.
          </p>
        </header>

        <NewMessageForm />
      </main>
    </>
  );
}
