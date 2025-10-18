import Link from "next/link";
import type { Route } from "next";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-24 border-t border-black/5 bg-[color:var(--bg)]"
      role="contentinfo"
      aria-label="Подвал сайта"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-12 md:grid-cols-3">
        {/* Бренд и слоган */}
        <div className="space-y-1">
          <div className="text-sm font-semibold tracking-wide text-[color:var(--fg)]">
            Echo
          </div>
          <p className="text-sm text-[color:var(--muted)]">
            Послания, которые будут доставлены после нас.
          </p>
        </div>

        {/* Навигация */}
        <nav
          aria-label="Навигация по разделам"
          className="flex flex-wrap justify-start gap-x-6 gap-y-2 text-sm md:justify-center"
        >
          <Link
            href={"/security" as Route}
            className="rounded-lg px-1 text-[color:var(--fg)]/80 transition hover:text-[color:var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
          >
            Безопасность
          </Link>

          <a
            href="mailto:hello@echoproject.space"
            className="rounded-lg px-1 text-[color:var(--fg)]/80 transition hover:text-[color:var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
          >
            Контакты
          </a>

          <a
            href="https://github.com/echopro-create/echo-3.0"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-1 text-[color:var(--fg)]/80 transition hover:text-[color:var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
          >
            GitHub
          </a>
        </nav>

        {/* Копирайт / версия */}
        <div className="text-left text-sm text-[color:var(--muted)] md:text-right">
          © {year} · v3.0
        </div>
      </div>
    </footer>
  );
}
