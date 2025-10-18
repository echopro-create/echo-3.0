import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";

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
      <main id="main" className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
          Новое послание
        </h1>
        <p className="mt-3 text-[color:var(--muted)]">
          Каркас страницы готов. На следующем шаге добавим форму: контент, получатели, триггер.
        </p>

        <section className="mt-8 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5">
          <ul className="list-disc pl-5 text-sm text-[color:var(--muted)]">
            <li>Поле контента: текст/голос/видео/файл</li>
            <li>Получатели</li>
            <li>Триггер: дата, событие или «после моей смерти»</li>
            <li>Предпросмотр и сохранение черновика</li>
          </ul>
        </section>
      </main>
    </>
  );
}
