import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="text-sm uppercase tracking-widest opacity-60">Ошибка 404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
        Страница не найдена
      </h1>
      <p className="mx-auto mt-4 max-w-xl opacity-80">
        Кажется, вы вышли за границы карты. Вернитесь на главную или посмотрите,
        как работает Echo: форматы, доставка и приватность.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium
                     bg-[color:var(--fg)] text-[color:var(--bg)]
                     hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          На главную
        </Link>
        <Link
          href="/#formats"
          className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium
                     ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Форматы
        </Link>
        <Link
          href="/#delivery"
          className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium
                     ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Доставка
        </Link>
        <Link
          href="/#privacy"
          className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium
                     ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Приватность
        </Link>
      </div>

      <p className="mt-6 text-xs opacity-60">
        Если вы уверены, что страница должна существовать, напишите:{" "}
        <a href="mailto:hello@echoproject.space" className="underline">
          hello@echoproject.space
        </a>
      </p>
    </main>
  );
}
