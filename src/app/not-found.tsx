import Link from "next/link";
import type { Route } from "next";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70svh] max-w-3xl flex-col items-start justify-center gap-6 px-4 py-16">
      {/* Декор как на HERO — лёгкая сетка, чтобы не было пустоты */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]">
        <div className="absolute inset-0 [background-size:32px_32px] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] text-[color:var(--fg)]" />
      </div>

      <p className="text-xs uppercase tracking-widest opacity-60">Ошибка 404</p>
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
        Страница не найдена
      </h1>
      <p className="max-w-2xl opacity-80 md:text-lg">
        Тут пусто. Возможно, ссылка устарела или была набрана с опечаткой. Ничего страшного,
        у нас есть план Б: вернуться на главную или открыть нужный раздел.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium
                     bg-[color:var(--fg)] text-[color:var(--bg)]
                     hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          На главную
        </Link>

        <Link
          href="/#start"
          className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium
                     ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Создать послание
        </Link>

        <Link
          href="/#delivery"
          className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium
                     ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Как это работает
        </Link>
      </div>

      <div className="pt-6">
        <ul className="flex flex-wrap gap-3 text-xs opacity-80">
          <li className="rounded-xl border border-[var(--ring)] px-3 py-2">
            Шифрование на устройстве
          </li>
          <li className="rounded-xl border border-[var(--ring)] px-3 py-2">
            RLS: доступ только владельцу
          </li>
          <li className="rounded-xl border border-[var(--ring)] px-3 py-2">
            Ключи отдельно от данных
          </li>
          <li className="rounded-xl border border-[var(--ring)] px-3 py-2">
            <Link href={"/security" as Route} className="underline">
              Архитектура безопасности
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
