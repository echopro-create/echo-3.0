import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { SignOutButton } from "@/components/signout-button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
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
          Аккаунт
        </h1>
        <section className="mt-6 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5">
          <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[color:var(--muted)]">Email</dt>
              <dd className="mt-1 text-[color:var(--fg)]">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-[color:var(--muted)]">ID пользователя</dt>
              <dd className="mt-1 text-[color:var(--fg)]">{user?.id}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <SignOutButton />
          </div>
        </section>
      </main>
    </>
  );
}
