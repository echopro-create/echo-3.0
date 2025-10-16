import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="mb-3 text-3xl font-semibold tracking-tight">Страница не найдена</h1>
      <p className="opacity-80">
        Возможно, ссылка устарела или опечатка в адресе. Вернитесь на главную и продолжим без цирка.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-block rounded-xl border border-[var(--ring)] px-4 py-2 text-sm hover:opacity-100 opacity-80"
        >
          На главную
        </Link>
      </div>
    </main>
  );
}
