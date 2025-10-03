// app/s/[token]/Client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type FileView = {
  id: string;
  url: string | null;
  mime: string | null;
  bytes: number | null;
  name: string;
  created_at: string | null;
};

type ShareMeta = {
  expires_at: string | null;
  views: number;
  max_views: number | null;
  revoked: boolean;
  password_protected: boolean;
};

type MessageView = {
  id: string;
  kind: "text" | "audio" | "video" | "files";
  content: string | null;
  delivery_mode: "heartbeat" | "date";
  deliver_at: string | null;
  created_at: string | null;
};

export default function PublicShareClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [share, setShare] = useState<ShareMeta | null>(null);
  const [message, setMessage] = useState<MessageView | null>(null);
  const [files, setFiles] = useState<FileView[]>([]);

  const storageKey = useMemo(() => `echo-share-pw:${token}`, [token]);

  async function load(withPassword?: string) {
    setLoading(true);
    setError(null);
    try {
      const q = withPassword ? `?pw=${encodeURIComponent(withPassword)}` : "";
      const res = await fetch(`/api/public-share/${token}${q}`, { cache: "no-store" });
      const j = await res.json().catch(() => ({} as any));

      if (!res.ok || !j?.ok) {
        const msg = String(j?.error || `HTTP ${res.status}`);
        if (res.status === 401) throw new Error("Password required");
        if (res.status === 404) throw new Error("Not found");
        if (res.status === 410) throw new Error("Link unavailable");
        throw new Error(msg);
      }

      setShare(j.share as ShareMeta);
      setMessage(j.message as MessageView);
      setFiles((j.files as FileView[]) || []);
    } catch (e: any) {
      setShare(null);
      setMessage(null);
      setFiles([]);
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey) || "";
    if (saved) {
      setPw(saved);
      load(saved);
    } else {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function humanBytes(n?: number | null) {
    if (!n || n <= 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0; let x = n;
    while (x >= 1024 && i < units.length - 1) { x /= 1024; i++; }
    return `${x.toFixed(1)} ${units[i]}`;
  }
  function safeDate(s: string | null) {
    if (!s) return "—";
    const t = new Date(s);
    return Number.isNaN(t.getTime()) ? "—" : t.toLocaleString("ru-RU");
  }

  const needsPassword = error === "Password required";

  return (
    <div className="container py-8" style={{ maxWidth: 900 }}>
      <h1 className="text-2xl font-semibold mb-4">Публичный просмотр</h1>

      {/* форма пароля */}
      {needsPassword && (
        <div className="card p-4 grid gap-3 max-w-xl">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const p = pw.trim();
              if (!p) return;
              await load(p);
              // если не стало 401 — считаем пароль годным и запоминаем
              if (!loading && error !== "Password required") {
                sessionStorage.setItem(storageKey, p);
              }
            }}
            className="grid gap-3"
          >
            <input
              type="password"
              className="input"
              placeholder="Введите пароль"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <button type="submit" className="btn">Открыть</button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setPw("");
                  sessionStorage.removeItem(storageKey);
                }}
              >
                Очистить
              </button>
            </div>
            <div className="text-sm text-red-600">Password required</div>
          </form>
        </div>
      )}

      {/* другие ошибки */}
      {!needsPassword && error && (
        <div className="card p-4 text-red-600 max-w-xl">{error}</div>
      )}

      {/* контент */}
      {!needsPassword && !error && (
        <>
          <div className="card p-4 grid gap-2 max-w-xl">
            <div className="text-sm opacity-70">
              Просмотры: {share?.views ?? 0}
              {share?.max_views ? ` / лимит ${share.max_views}` : ""} ·
              Истекает: {safeDate(share?.expires_at ?? null)} ·
              Пароль: {share?.password_protected ? "включен" : "выключен"}
            </div>
            {message?.content && (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>

          {files.length > 0 && (
            <div className="card p-4 grid gap-3">
              <div className="font-medium">Вложения</div>
              <ul className="grid gap-4">
                {files.map((f) => (
                  <li key={f.id} className="grid gap-2">
                    <div className="text-sm flex items-center justify-between gap-3">
                      <span className="truncate">
                        {f.name}
                        {f.bytes ? ` · ${humanBytes(f.bytes)}` : ""}
                        {f.created_at ? ` · ${safeDate(f.created_at)}` : ""}
                      </span>
                      {f.url && (
                        <a className="btn secondary" href={f.url} target="_blank" rel="noreferrer">
                          Открыть
                        </a>
                      )}
                    </div>

                    {f.url && f.mime?.startsWith("audio") && (
                      <audio controls src={f.url} className="w-full" />
                    )}
                    {f.url && f.mime?.startsWith("video") && (
                      <video controls src={f.url} className="w-full rounded-xl bg-black/5" />
                    )}
                    {f.url && f.mime?.startsWith("image/") && (
                      <img src={f.url} alt={f.name} className="max-w-full rounded-xl border" />
                    )}
                    {f.url && f.mime === "application/pdf" && (
                      <iframe
                        src={f.url}
                        className="w-full rounded-xl"
                        style={{ minHeight: 420, background: "#fafafa", border: "1px solid #eee" }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {loading && <div className="text-sm opacity-70">Загрузка…</div>}
    </div>
  );
}
