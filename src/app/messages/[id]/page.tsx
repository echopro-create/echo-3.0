import Link from "next/link";

export default function MessageViewPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Послание</h1>
      <p className="opacity-80">Страница просмотра в разработке. Терпение — тоже ресурс.</p>
      <div className="mt-4 rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm">
        <div className="text-sm opacity-70">ID: {id}</div>
      </div>
      <div className="mt-6">
        <Link href="/messages" className="text-sm underline opacity-90 hover:opacity-100">
          ← Вернуться к списку
        </Link>
      </div>
    </main>
  );
}
