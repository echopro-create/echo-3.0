import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/signout-button";

export const metadata = { title: "Аккаунт — Echo" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const provider =
    (user.app_metadata?.provider as string | undefined) ?? "email";

  // Аккуратно расширяем тип пользователя без any
  type UserWithLastSignIn = typeof user & Partial<{ last_sign_in_at: string | null }>;
  const lastSignIn = (user as UserWithLastSignIn).last_sign_in_at ?? null;
  const createdAt = user.created_at ?? null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Аккаунт</h1>
      <p className="mb-8 opacity-80">
        Профиль и доступ. Здесь можно выйти из аккаунта и проверить параметры безопасности.
      </p>

      {/* Профиль */}
      <section
        aria-labelledby="profile-title"
        className="rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="profile-title" className="text-lg font-medium">
            Профиль
          </h2>
          <SignOutButton />
        </div>

        <dl className="grid gap-3 text-sm">
          <div className="grid grid-cols-3 items-baseline gap-3">
            <dt className="opacity-70">Почта</dt>
            <dd className="col-span-2 break-words opacity-90">{user.email}</dd>
          </div>
          <div className="grid grid-cols-3 items-baseline gap-3">
            <dt className="opacity-70">Идентификатор</dt>
            <dd className="col-span-2 break-words opacity-90">{user.id}</dd>
          </div>
          <div className="grid grid-cols-3 items-baseline gap-3">
            <dt className="opacity-70">Провайдер</dt>
            <dd className="col-span-2 opacity-90">{provider}</dd>
          </div>
          <div className="grid grid-cols-3 items-baseline gap-3">
            <dt className="opacity-70">Создан</dt>
            <dd className="col-span-2 opacity-90">
              {createdAt
                ? new Intl.DateTimeFormat("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(createdAt))
                : "—"}
            </dd>
          </div>
          <div className="grid grid-cols-3 items-baseline gap-3">
            <dt className="opacity-70">Последний вход</dt>
            <dd className="col-span-2 opacity-90">
              {lastSignIn
                ? new Intl.DateTimeFormat("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(lastSignIn))
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      {/* Безопасность */}
      <section
        aria-labelledby="security-title"
        className="mt-8 rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm"
      >
        <h2 id="security-title" className="mb-3 text-lg font-medium">
          Безопасность
        </h2>
        <p className="text-sm opacity-80">
          Шифрование на устройстве и доступ по политикам RLS. Подробности в разделе{" "}
          <a
            href="/security"
            className="underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg"
          >
            «Архитектура безопасности»
          </a>
          .
        </p>
      </section>
    </main>
  );
}
