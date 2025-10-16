import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/signout-button";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-[color:var(--bg)]/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* ЛОГОТИП — оставляю как у тебя */}
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded-xl bg-[color:var(--fg)]/10 dark:bg-white/10" />
          <span className="text-sm font-medium tracking-wide">ECHO 3.0</span>
        </Link>

        {/* Навигация по секциям лендинга */}
        <nav className="hidden gap-6 text-sm md:flex">
          <Link href="#formats" className="opacity-80 hover:opacity-100">
            Форматы
          </Link>
          <Link href="#delivery" className="opacity-80 hover:opacity-100">
            Доставка
          </Link>
          <Link href="#privacy" className="opacity-80 hover:opacity-100">
            Приватность
          </Link>
        </nav>

        {/* Правый блок: гостю — Начать; пользователю — Послания/Аккаунт/Выйти */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/messages"
                className="opacity-80 hover:opacity-100 text-sm"
              >
                Послания
              </Link>
              <Link
                href="/account"
                className="opacity-80 hover:opacity-100 text-sm"
              >
                Аккаунт
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/#start"
              className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5"
            >
              Начать
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
