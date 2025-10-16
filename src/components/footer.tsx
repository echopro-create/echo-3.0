import Link from "next/link";
import type { Route } from "next";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-black/10 bg-[color:var(--bg)]">
      <div className="mx-auto grid max-w-6xl items-start gap-6 px-4 py-8 md:grid-cols-3">
        {/* Бренд и слоган */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-[color:var(--fg)]">Echo</div>
          <div className="text-sm text-[color:var(--fg)]/70">
            Послания, которые будут доставлены после нас.
          </div>
        </div>

        {/* Навигация (без якорей) */}
        <nav
          aria-label="Навигация по разделам"
          className="flex flex-wrap justify-start gap-x-6 gap-y-2 text-sm md:justify-center"
        >
          <Link
            href={"/security" as Route}
            className="rounded-lg px-1 text-[color:var(--fg)]/80 hover:text-[color:var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Безопасность
          </Link>
          <a
            href="mailto:hello@echoproject.space"
            className="rounded-lg px-1 text-[color:var(--fg)]/80 hover:text-[color:var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Контакты
          </a>
          <a
            href="https://github.com/echopro-create/echo-3.0"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-1 text-[color:var(--fg)]/80 hover:text-[color:var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            GitHub
          </a>
        </nav>

        {/* Копирайт / версия */}
        <div className="text-right text-sm text-[color:var(--fg)]/70 md:text-right">
          © {year} • v3.0
        </div>
      </div>
    </footer>
  );
}
