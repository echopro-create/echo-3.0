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
      <main id="main" className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
          Новое послание
        </h1>
        <p className="mt-3 text-[color:var(--muted)]">
          Заполните содержимое, укажите получателей и выберите триггер доставки.
        </p>

        <NewMessageForm />
      </main>
    </>
  );
}
