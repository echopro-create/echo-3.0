import Link from "next/link";

export default function MessageEditPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Редактирование</h1>
      <p className="opacity-80">Редактор появится после подключения CRUD. Пока это цивильная заглушка.</p>
      <div className="mt-4 rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm">
        <div className="text-sm opacity-70">ID: {id}</div>
      </div>
      <div className="mt-6 flex gap-4">
        <Link href={`/messages/${id}`} className="text-sm underline opacity-90 hover:opacity-100">
          Открыть
        </Link>
        <Link href="/messages" className="text-sm underline opacity-90 hover:opacity-100">
          К списку
        </Link>
      </div>
    </main>
  );
}
