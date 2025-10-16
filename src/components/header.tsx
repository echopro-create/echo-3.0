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
        {/* ЛОГО */}
        <Link href="/" className="flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg">
          <span className="inline-block h-6 w-6 rounded-xl bg-[color:var(--fg)]/10 dark:bg-white/10" />
          <span className="text-sm font-medium tracking-wide">ECHO 3.0</span>
        </Link>

        {/* Десктоп-навигация */}
        <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Основная навигация">
          <Link href="/#formats" className="opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg px-1">
            Форматы
          </Link>
          <Link href="/#delivery" className="opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg px-1">
            Доставка
          </Link>
          <Link href="/#privacy" className="opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg px-1">
            Приватность
          </Link>
          <Link href="/security" className="opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg px-1">
            Безопасность
          </Link>
        </nav>

        {/* Правый блок */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link href="/messages" className="text-sm opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg px-1">
                Послания
              </Link>
              <Link href="/account" className="text-sm opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg px-1">
                Аккаунт
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/#start"
              className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Начать
            </Link>
          )}
        </div>

        {/* Мобильное меню без JS на details/summary */}
        <details className="group relative md:hidden">
          <summary
            aria-label="Открыть меню"
            className="inline-flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg ring-1 ring-[color:var(--fg)]/15 hover:bg-[color:var(--fg)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {/* иконка-бургер */}
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </summary>

          <div
            className="absolute right-0 mt-2 w-[88vw] max-w-xs rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-2 shadow-lg"
            role="menu"
            aria-label="Меню"
          >
            <div className="grid">
              <Link href="/#formats" role="menuitem" className="rounded-xl px-3 py-2 text-sm opacity-90 hover:bg-[color:var(--fg)]/5">
                Форматы
              </Link>
              <Link href="/#delivery" role="menuitem" className="rounded-xl px-3 py-2 text-sm opacity-90 hover:bg-[color:var(--fg)]/5">
                Доставка
              </Link>
              <Link href="/#privacy" role="menuitem" className="rounded-xl px-3 py-2 text-sm opacity-90 hover:bg-[color:var(--fg)]/5">
                Приватность
              </Link>
              <Link href="/security" role="menuitem" className="rounded-xl px-3 py-2 text-sm opacity-90 hover:bg-[color:var(--fg)]/5">
                Безопасность
              </Link>

              <div className="my-1 h-px bg-[var(--ring)]" />

              {user ? (
                <>
                  <Link href="/messages" role="menuitem" className="rounded-xl px-3 py-2 text-sm opacity-90 hover:bg-[color:var(--fg)]/5">
                    Послания
                  </Link>
                  <Link href="/account" role="menuitem" className="rounded-xl px-3 py-2 text-sm opacity-90 hover:bg-[color:var(--fg)]/5">
                    Аккаунт
                  </Link>
                  <div className="px-2 py-1">
                    <SignOutButton />
                  </div>
                </>
              ) : (
                <Link
                  href="/#start"
                  role="menuitem"
                  className="rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5"
                >
                  Начать
                </Link>
              )}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
