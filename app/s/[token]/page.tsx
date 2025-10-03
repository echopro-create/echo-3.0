export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ShareFile = {
  id: string;
  url: string | null;
  mime: string | null;
  bytes: number | null;
  created_at: string | null;
  name: string;
};

function humanBytes(n?: number | null) {
  if (!n || n <= 0) return "";
  const units = ["B","KB","MB","GB"]; let i=0; let x=n;
  while (x >= 1024 && i < units.length-1) { x/=1024; i++; }
  return `${x.toFixed(1)} ${units[i]}`;
}
function safeDate(s?: string | null) {
  if (!s) return "—";
  const t = new Date(s);
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleString("ru-RU");
}
function canInline(m?: string | null) {
  return !!m && (m.startsWith("audio") || m.startsWith("video") || m.startsWith("image/") || m === "application/pdf");
}

async function getShare(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/public-share/${encodeURIComponent(token)}`, { cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok && json?.ok, data: json, status: res.status, error: json?.error };
}

export default async function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { ok, data, status, error } = await getShare(token || "");

  if (!ok) {
    const text = status === 410 ? "Ссылка истекла." : error || "Ссылка недоступна.";
    return (
      <div className="container py-6 grid gap-3" style={{ maxWidth: 860 }}>
        <h1 className="title text-2xl font-semibold">Публичный просмотр</h1>
        <div className="card text-red-600">{text}</div>
      </div>
    );
  }

  const msg = data.message as { kind: string; content?: string | null; delivery_mode: string; deliver_at?: string | null; created_at: string };
  const files = data.files as ShareFile[];

  return (
    <div className="container py-6 grid gap-4" style={{ maxWidth: 860 }}>
      <h1 className="title text-2xl font-semibold">Послание</h1>

      <div className="card grid gap-2">
        <div className="text-sm opacity-70">Создано: {safeDate(msg.created_at)}</div>
        <div className="text-sm">Тип: {msg.kind === "text" ? "Текст" : msg.kind === "audio" ? "Голос" : msg.kind === "video" ? "Видео" : "Файлы"}</div>
        <div className="text-sm">
          Доставка: {msg.delivery_mode === "heartbeat"
            ? "по пульсу"
            : `по дате${msg.deliver_at ? ` — ${safeDate(msg.deliver_at)}` : ""}`}
        </div>
      </div>

      {msg.content && <div className="card whitespace-pre-wrap">{msg.content}</div>}

      {files?.length > 0 && (
        <div className="card grid gap-3">
          <div className="font-medium">Вложения</div>
          <ul className="grid gap-4">
            {files.map(f => (
              <li key={f.id} className="grid gap-2">
                <div className="text-sm flex items-center justify-between gap-3">
                  <span className="truncate">
                    {f.name}{f.bytes ? ` · ${humanBytes(f.bytes)}` : ""}{f.created_at ? ` · ${safeDate(f.created_at)}` : ""}
                  </span>
                  {f.url && !canInline(f.mime) && (
                    <a className="btn secondary" href={f.url} target="_blank" rel="noreferrer">Скачать</a>
                  )}
                </div>

                {f.url && f.mime?.startsWith("audio") && <audio controls src={f.url} className="w-full" />}
                {f.url && f.mime?.startsWith("video") && <video controls src={f.url} className="w-full rounded-xl bg-black/5" />}
                {f.url && f.mime?.startsWith("image/") && <img src={f.url} alt={f.name} className="max-w-full rounded-xl border" />}
                {f.url && f.mime === "application/pdf" && (
                  <iframe src={f.url} className="w-full rounded-xl" style={{ minHeight: 420, background: "#fafafa", border: "1px solid #eee" }} />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(!files || files.length === 0) && !msg.content && (
        <div className="card text-sm opacity-70">Содержимого нет.</div>
      )}
    </div>
  );
}
