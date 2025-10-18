import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/signout-button";
import type { Route } from "next";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-black/10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70"
      role="banner"
    >
      {/* Skip link для клавиатуры и скринридеров */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-[color:var(--fg)] focus:px-3 focus:py-2 focus:text-[color:var(--bg)] focus:shadow-sm"
      >
        Перейти к содержимому
      </a>

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* ЛОГО */}
        <Link
          href="/"
          rel="home"
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="Echo — главная"
        >
          {/* логомарк */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="shrink-0 text-[color:var(--fg)]"
          >
            <path
              d="M12 6.5c2.2 0 3.5 1.76 3.5 3.5 0 2.92-2.17 5.5-3.5 7-1.33-1.5-3.5-4.08-3.5-7 0-1.74 1.3-3.5 3.5-3.5Z"
              fill="currentColor"
              opacity="0.12"
            />
            <path
              d="M12 9.5c.97 0 1.75.78 1.75 1.75 0 1.38-1.06 2.6-1.75 3.38-.69-.78-1.75-2-1.75-3.38 0-.97.78-1.75 1.75-1.75Z"
              fill="currentColor"
              opacity="0.28"
            />
            <path d="M16.5 8.5c1.45 1.37 1.45 3.63 0 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9" />
            <path d="M18.75 6.75c2.53 2.4 2.53 6.1 0 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.55" />
            <path d="M7.5 8.5c-1.45 1.37-1.45 3.63 0 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9" />
            <path d="M5.25 6.75c-2.53 2.4-2.53 6.1 0 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.55" />
          </svg>
          <span className="text-sm font-medium tracking-wide text-[color:var(--fg)]">ECHO 3.0</span>
        </Link>

        {/* Мини-навигация */}
        <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Основная навигация">
          <Link
            href={"/security" as Route}
            className="rounded-lg px-1 text-[color:var(--fg)]/80 transition hover:text-[color:var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Безопасность
          </Link>
        </nav>

        {/* Правый блок */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href="/messages"
                className="rounded-lg px-1 text-sm text-[color:var(--fg)]/80 transition hover:text-[color:var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Послания
              </Link>
              <Link
                href="/account"
                className="rounded-lg px-1 text-sm text-[color:var(--fg)]/80 transition hover:text-[color:var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Аккаунт
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-[color:var(--fg)] ring-1 ring-black/15 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Войти
            </Link>
          )}
        </div>

        {/* Мобильное меню без JS */}
        <details className="group relative md:hidden">
          <summary
            aria-label="Открыть меню"
            className="inline-flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg ring-1 ring-black/15 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </summary>

          <div
            className="absolute right-0 mt-2 w-[88vw] max-w-xs rounded-2xl border border-black/10 bg-white p-2 shadow-lg"
            role="menu"
            aria-label="Меню"
          >
            <div className="grid">
              <Link href={"/security" as Route} role="menuitem" className="rounded-xl px-3 py-2 text-sm text-[color:var(--fg)]/90 transition hover:bg-black/5">
                Безопасность
              </Link>

              <div className="my-1 h-px bg-black/10" />

              {user ? (
                <>
                  <Link href="/messages" role="menuitem" className="rounded-xl px-3 py-2 text-sm text-[color:var(--fg)]/90 transition hover:bg-black/5">
                    Послания
                  </Link>
                  <Link href="/account" role="menuitem" className="rounded-xl px-3 py-2 text-sm text-[color:var(--fg)]/90 transition hover:bg-black/5">
                    Аккаунт
                  </Link>
                  <div className="px-2 py-1">
                    <SignOutButton />
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  role="menuitem"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--fg)] ring-1 ring-black/15 transition hover:bg-black/5"
                >
                  Войти
                </Link>
              )}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
