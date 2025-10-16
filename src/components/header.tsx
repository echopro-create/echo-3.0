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
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[color:var(--bg)]/70 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--bg)]/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* ЛОГО */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="Echo — главная"
        >
          {/* Логомарк: «эхо/волны» + «семя/капсула» */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="shrink-0 text-[color:var(--fg)]"
          >
            {/* капсула/семя */}
            <path
              d="M12 6.5c2.2 0 3.5 1.76 3.5 3.5 0 2.92-2.17 5.5-3.5 7-1.33-1.5-3.5-4.08-3.5-7 0-1.74 1.3-3.5 3.5-3.5Z"
              fill="currentColor"
              opacity="0.15"
            />
            {/* внутреннее эхо */}
            <path
              d="M12 9.5c.97 0 1.75.78 1.75 1.75 0 1.38-1.06 2.6-1.75 3.38-.69-.78-1.75-2-1.75-3.38 0-.97.78-1.75 1.75-1.75Z"
              fill="currentColor"
              opacity="0.35"
            />
            {/* волны эхо */}
            <path
              d="M16.5 8.5c1.45 1.37 1.45 3.63 0 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
            <path
              d="M18.75 6.75c2.53 2.4 2.53 6.1 0 8.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
            <path
              d="M7.5 8.5c-1.45 1.37-1.45 3.63 0 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
            <path
              d="M5.25 6.75c-2.53 2.4-2.53 6.1 0 8.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
          </svg>
          <span className="text-sm font-medium tracking-wide text-[color:var(--fg)]">ECHO 3.0</span>
        </Link>

        {/* Мини-навигация: без якорей, только отдельные страницы */}
        <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Основная навигация">
          <Link
            href={"/security" as Route}
            className="rounded-lg px-1 text-[color:var(--fg)]/80 hover:text-[color:var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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
                className="rounded-lg px-1 text-sm text-[color:var(--fg)]/80 hover:text-[color:var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Послания
              </Link>
              <Link
                href="/account"
                className="rounded-lg px-1 text-sm text-[color:var(--fg)]/80 hover:text-[color:var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Аккаунт
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-[color:var(--fg)] ring-1 ring-white/15 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
