import Link from "next/link";
import type { Route } from "next";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6 md:grid-cols-3 items-start">
        {/* Бренд и слоган */}
        <div className="space-y-1">
          <div className="text-sm font-medium">Echo</div>
          <div className="text-sm opacity-70">Послания, которые приходят вовремя.</div>
        </div>

        {/* Навигация */}
        <nav
          aria-label="Навигация по разделам"
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm justify-start md:justify-center"
        >
          <Link
            href="/#formats"
            className="underline underline-offset-4 hover:opacity-100 opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg"
          >
            Форматы
          </Link>
          <Link
            href="/#delivery"
            className="underline underline-offset-4 hover:opacity-100 opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg"
          >
            Доставка
          </Link>
          <Link
            href="/#privacy"
            className="underline underline-offset-4 hover:opacity-100 opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg"
          >
            Приватность
          </Link>
          <Link
            href={"/security" as Route}
            className="underline underline-offset-4 hover:opacity-100 opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg"
          >
            Архитектура безопасности
          </Link>
          <a
            href="mailto:hello@echoproject.space"
            className="underline underline-offset-4 hover:opacity-100 opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg"
          >
            Контакты
          </a>
          <a
            href="https://github.com/echopro-create/echo-3.0"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:opacity-100 opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg"
          >
            GitHub
          </a>
        </nav>

        {/* Копирайт/версия */}
        <div className="text-sm text-right md:text-right opacity-70">
          © {year} • v3.0
        </div>
      </div>
    </footer>
  );
}
