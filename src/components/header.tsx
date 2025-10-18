import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/signout-button";
import { NavLink } from "@/components/nav-link";
import type { Route } from "next";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-black/5 bg-[color:var(--bg)]/80 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--bg)]/70"
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
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
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
          <NavLink
            href={"/security" as Route}
            ariaLabel="Безопасность"
            activeClassName="text-[color:var(--fg)]"
            inactiveClassName="text-[color:var(--fg)]/80 hover:text-[color:var(--fg)]"
            exact
          >
            Безопасность
          </NavLink>
        </nav>

        {/* Правый блок */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <NavLink
                href="/messages"
                ariaLabel="Послания"
                activeClassName="text-[color:var(--fg)]"
                inactiveClassName="text-[color:var(--fg)]/80 hover:text-[color:var(--fg)]"
              >
                Послания
              </NavLink>
              <NavLink
                href="/account"
                ariaLabel="Аккаунт"
                activeClassName="text-[color:var(--fg)]"
                inactiveClassName="text-[color:var(--fg)]/80 hover:text-[color:var(--fg)]"
              >
                Аккаунт
              </NavLink>
              <SignOutButton />
            </>
          ) : (
            <NavLink
              href="/login"
              ariaLabel="Войти"
              activeClassName="text-[color:var(--fg)]"
              inactiveClassName="text-[color:var(--fg)]"
              className="inline-flex h-9 items-center rounded-xl px-3 text-sm font-medium ring-1 ring-black/10 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
              exact
            >
              Войти
            </NavLink>
          )}
        </div>

        {/* Мобильное меню без JS */}
        <details className="group relative md:hidden">
          <summary
            aria-label="Открыть меню"
            className="inline-flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-xl ring-1 ring-black/10 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </summary>

          <div
            className="absolute right-0 mt-2 w-[88vw] max-w-xs rounded-2xl bg-white/95 p-2 shadow-lg ring-1 ring-black/10 backdrop-blur"
            role="menu"
            aria-label="Меню"
          >
            <div className="grid">
              <NavLink
                href={"/security" as Route}
                ariaLabel="Безопасность"
                className="rounded-xl px-3 py-2 text-sm transition"
                activeClassName="text-[color:var(--fg)] bg-black/5"
                inactiveClassName="text-[color:var(--fg)]/90 hover:bg-black/5"
                exact
                role="menuitem"
              >
                Безопасность
              </NavLink>

              <div className="my-1 h-px bg-black/10" />

              {user ? (
                <>
                  <NavLink
                    href="/messages"
                    ariaLabel="Послания"
                    className="rounded-xl px-3 py-2 text-sm transition"
                    activeClassName="text-[color:var(--fg)] bg-black/5"
                    inactiveClassName="text-[color:var(--fg)]/90 hover:bg-black/5"
                    role="menuitem"
                  >
                    Послания
                  </NavLink>
                  <NavLink
                    href="/account"
                    ariaLabel="Аккаунт"
                    className="rounded-xl px-3 py-2 text-sm transition"
                    activeClassName="text-[color:var(--fg)] bg-black/5"
                    inactiveClassName="text-[color:var(--fg)]/90 hover:bg-black/5"
                    role="menuitem"
                  >
                    Аккаунт
                  </NavLink>
                  <div className="px-2 py-1">
                    <SignOutButton />
                  </div>
                </>
              ) : (
                <NavLink
                  href="/login"
                  ariaLabel="Войти"
                  className="rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-black/10 transition hover:bg-black/5"
                  activeClassName="text-[color:var(--fg)] bg-black/5"
                  inactiveClassName="text-[color:var(--fg)]"
                  role="menuitem"
                  exact
                >
                  Войти
                </NavLink>
              )}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
