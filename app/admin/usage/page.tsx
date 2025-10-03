import { createSupabaseServerClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Простой форматтер размера
function fmt(n: number) {
  if (!n) return "0 B";
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

export default async function AdminUsagePage() {
  const supabase = await createSupabaseServerClient();

  // guard по whitelist
  const { data: me } = await supabase.auth.getUser();
  const uid = me.user?.id || null;
  const whitelist = (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  if (!uid || !whitelist.includes(uid)) {
    return new Response("Not Found", { status: 404 }) as any;
  }

  // В твоей БД нет message_files.created_at, поэтому забираем дату из messages.created_at.
  // Вытягиваем:
  // - bytes из message_files
  // - owner user_id и created_at из messages через inner join
  const { data, error } = await supabase
    .from("message_files")
    .select(`
      bytes,
      messages!inner (
        user_id,
        created_at
      )
    `)
    .limit(20000);

  if (error) {
    return (
      <div className="container py-6" style={{ maxWidth: 960 }}>
        <h1 className="text-2xl font-semibold">Storage usage</h1>
        <div className="text-red-600 mt-4 text-sm">Ошибка выборки: {error.message}</div>
      </div>
    ) as any;
  }

  type Row = {
    user_id: string;
    total_bytes: number;
    files: number;
    last_at: string | null; // берём из messages.created_at как приближение
  };

  const byUser = new Map<string, Row>();
  for (const r of (data as any[])) {
    const user_id: string | undefined = r?.messages?.user_id;
    if (!user_id) continue;
    const bytes: number = Number(r?.bytes || 0);
    const msg_created: string | null = r?.messages?.created_at ?? null;

    const agg = byUser.get(user_id) || { user_id, total_bytes: 0, files: 0, last_at: null };
    agg.total_bytes += bytes;
    agg.files += 1;
    if (!agg.last_at || (msg_created && msg_created > agg.last_at)) agg.last_at = msg_created;
    byUser.set(user_id, agg);
  }

  const rows = Array.from(byUser.values()).sort((a, b) => b.total_bytes - a.total_bytes);
  const totalFiles = rows.reduce((s, r) => s + r.files, 0);
  const totalBytes = rows.reduce((s, r) => s + r.total_bytes, 0);

  return (
    <div className="container py-6" style={{ maxWidth: 960 }}>
      <h1 className="text-2xl font-semibold">Storage usage</h1>

      <div className="card mt-4">
        <div className="text-sm">Всего пользователей: {rows.length}</div>
        <div className="text-sm">Всего файлов: {totalFiles}</div>
        <div className="text-sm">Суммарный объём: {fmt(totalBytes)}</div>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2 pr-3">User ID</th>
              <th className="py-2 pr-3">Файлов</th>
              <th className="py-2 pr-3">Объём</th>
              <th className="py-2 pr-3">Последняя активность</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.user_id} className="border-t">
                <td className="py-2 pr-3 font-mono text-xs">{r.user_id}</td>
                <td className="py-2 pr-3">{r.files}</td>
                <td className="py-2 pr-3">{fmt(r.total_bytes)}</td>
                <td className="py-2 pr-3">{r.last_at ? new Date(r.last_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-sm opacity-70">Записей пока нет</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs opacity-70">
        Примечание: используется <code>messages.created_at</code> как приближение для «последней активности».
      </p>
    </div>
  ) as any;
}
