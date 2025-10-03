// app/components/SharePanel.tsx
"use client";

import { useEffect, useState } from "react";
import SharePassword from "@/app/components/SharePassword";

type ShareInfo = {
  token: string;
  url: string;
  expires_at: string | null;
  views: number;
  max_views: number | null;
  password_enabled: boolean;
} | null;

export default function SharePanel({ messageId }: { messageId: string }) {
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState<ShareInfo>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/shares/by-message/${messageId}`, { credentials: "include" });
      const j = await r.json().catch(() => ({} as any));
      if (!r.ok || !j.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      setShare(j.share ?? null);
    } catch (e: any) {
      setErr(e?.message || "Ошибка загрузки ссылки");
      setShare(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [messageId]);

  // метод для ручного рефреша (после установки/снятия пароля)
  const refresh = () => load();

  if (loading) {
    return (
      <div className="card grid gap-2">
        <div className="font-medium">Публичная ссылка</div>
        <div className="text-sm opacity-70">Загрузка…</div>
      </div>
    );
  }

  return (
    <div className="card grid gap-3">
      <div className="font-medium">Публичная ссылка</div>

      {err && <div className="text-sm text-red-600">{err}</div>}

      {share ? (
        <div className="grid gap-2">
          <div className="flex gap-2 items-center">
            <input
              className="input flex-1"
              readOnly
              value={share.url}
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              className="btn secondary"
              onClick={async () => {
                try { await navigator.clipboard.writeText(share.url); } catch {}
              }}
            >
              Копировать
            </button>
          </div>
          <div className="text-sm opacity-70">
            Просмотры: {share.views}{share.max_views ? ` / лимит ${share.max_views}` : ""} ·
            Истекает: {safeDate(share.expires_at)} ·
            Пароль: {share.password_enabled ? "включён" : "выключен"}
          </div>
          <SharePassword
            token={share.token}
            passwordEnabled={share.password_enabled}
          />
          <div>
            <button className="btn ghost text-xs" onClick={refresh}>Обновить статус</button>
          </div>
        </div>
      ) : (
        <div className="text-sm opacity-70">Ссылка ещё не создана. Нажмите «Создать публичную ссылку».</div>
      )}
    </div>
  );
}

function safeDate(s: string | null) {
  if (!s) return "—";
  const t = new Date(s);
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleString("ru-RU");
}
