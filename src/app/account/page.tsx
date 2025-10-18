import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { SignOutButton } from "@/components/signout-button";
import { pingPulse, setPulseTtl } from "./actions";

export const dynamic = "force-dynamic";

type PulseRow = {
  last_ping: string;
  ttl_days: number;
};

const fmtRu = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: pulse } = await supabase
    .from("user_pulse")
    .select("last_ping, ttl_days")
    .eq("user_id", user.id)
    .maybeSingle<PulseRow>();

  const lastPing = pulse?.last_ping ? fmtRu.format(new Date(pulse.last_ping)) : "—";
  const ttl = pulse?.ttl_days ?? 30;

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

        {/* Пульс и TTL */}
        <section className="mt-6 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="text-base font-semibold text-[color:var(--fg)]">Жизненный пульс</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Если пульс не обновлялся дольше выбранного срока, послания «после моей смерти» будут автоматически отправлены.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <div className="text-[color:var(--muted)]">Последний пинг</div>
              <div className="mt-1 text-[color:var(--fg)]">{lastPing}</div>
              <form action={pingPulse} className="mt-3">
                <button
                  type="submit"
                  className="rounded-lg border border-black/10 bg-black px-3 py-2 text-xs text-white transition hover:bg-black/90"
                >
                  Я здесь
                </button>
              </form>
            </div>

            <div>
              <div className="text-[color:var(--muted)]">Срок молчания (дней)</div>
              <form action={setPulseTtl} className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={7}
                  max={365}
                  name="ttl_days"
                  defaultValue={ttl}
                  className="w-24 rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-sm outline-none focus:border-black/20"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs transition hover:bg-black/[0.03]"
                >
                  Сохранить
                </button>
              </form>
              <div className="mt-1 text-xs text-[color:var(--muted)]">Допустимый диапазон: 7–365</div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
