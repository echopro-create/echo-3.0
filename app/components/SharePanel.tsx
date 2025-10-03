// app/components/SharePanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import SharePassword from "@/app/components/SharePassword";

type ShareInfo = {
  id?: string; // может не приходить из старого API, не обязателен
  token: string;
  url: string;
  expires_at: string | null;
  views: number;
  max_views: number | null;
  password_enabled: boolean;
  revoked?: boolean | null; // поддержка статуса, если отдаёт API
} | null;

export default function SharePanel({ messageId }: { messageId: string }) {
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState<ShareInfo>(null);
  const [err, setErr] = useState<string | null>(null);

  // локальное поле для max_views (удобнее редактировать, чем напрямую из share)
  const [maxViewsInput, setMaxViewsInput] = useState<string>("");

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/shares/by-message/${messageId}`, {
        credentials: "include",
        cache: "no-store",
      });
      const j = await r.json().catch(() => ({} as any));
      if (!r.ok || !j?.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      const s = (j.share ?? null) as ShareInfo;
      setShare(s);
      // синк инпута лимита
      if (s?.max_views == null || s.max_views === 0) setMaxViewsInput("");
      else setMaxViewsInput(String(s.max_views));
    } catch (e: any) {
      setErr(e?.message || "Ошибка загрузки ссылки");
      setShare(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageId]);

  const refresh = () => load();

  const statusText = useMemo(() => {
    if (!share) return "не создана";
    if (share.revoked) return "отозвана";
    return "активна";
  }, [share]);

  async function postToToken(payload: any) {
    if (!share?.token) return;
    const r = await fetch(`/api/shares/${share.token}`, {
      method: "POST", // если у тебя PATCH — поменяем, пока используем POST с action
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    const j = await r.json().catch(() => ({} as any));
    if (!r.ok || !j?.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    // многие твои ручки возвращают обновлённый share — попробуем взять
    if (j.share) {
      const s = j.share as ShareInfo;
      setShare(s);
      if (s?.max_views == null || s.max_views === 0) setMaxViewsInput("");
      else setMaxViewsInput(String(s.max_views));
    } else {
      // если не вернули — просто рефрешим состоянием
      await load();
    }
  }

  async function toggleRevoke() {
    try {
      if (!share) return;
      if (!share.revoked) {
        const ok = confirm("Отозвать публичную ссылку? Она перестанет открываться.");
        if (!ok) return;
        await postToToken({ action: "revoke" });
      } else {
        const ok = confirm("Восстановить публичную ссылку? Она снова станет доступна.");
        if (!ok) return;
        await postToToken({ action: "unrevoke" });
      }
    } catch (e: any) {
      alert("Ошибка: " + (e?.message || e));
    }
  }

  async function saveLimit() {
    try {
      if (!share) return;
      const trimmed = maxViewsInput.trim();
      const value = trimmed === "" ? null : Math.max(0, Number(trimmed));
      if (trimmed !== "" && (!Number.isFinite(value as number) || (value as number) < 0)) {
        alert("Укажите число не меньше 0 или оставьте пустым для «без ограничений».");
        return;
      }
      await postToToken({ action: "update", max_views: value });
      alert("Лимит просмотров сохранён.");
    } catch (e: any) {
      alert("Ошибка: " + (e?.message || e));
    }
  }

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
        <div className="grid gap-3">
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
                try {
                  await navigator.clipboard.writeText(share.url);
                } catch {
                  // eslint-disable-next-line no-alert
                  alert("Не удалось скопировать. Выделите и скопируйте ссылку вручную.");
                }
              }}
            >
              Копировать
            </button>
          </div>

          <div className="text-sm opacity-70">
            Статус: {statusText} · Просмотры: {share.views}
            {share.max_views ? ` / лимит ${share.max_views}` : ""} · Истекает: {safeDate(share.expires_at)} · Пароль:{" "}
            {share.password_enabled ? "включён" : "выключен"}
          </div>

          {/* Управление: пароль */}
          <SharePassword
            token={share.token}
            passwordEnabled={!!share.password_enabled}
            onChanged={refresh}
          />

          {/* Управление: лимит просмотров */}
          <div className="grid gap-2">
            <label className="text-sm opacity-70">Лимит просмотров</label>
            <div className="flex items-center gap-2">
              <input
                className="input w-36"
                inputMode="numeric"
                placeholder="без лимита"
                value={maxViewsInput}
                onChange={(e) => setMaxViewsInput(e.target.value.replace(/[^\d]/g, ""))}
              />
              <button className="btn" onClick={saveLimit}>
                Сохранить
              </button>
              <span className="text-xs opacity-60">Оставьте пустым для «без ограничений»</span>
            </div>
          </div>

          {/* Управление: отзыв/восстановление */}
          <div className="flex items-center gap-2">
            {!share.revoked ? (
              <button className="btn danger" onClick={toggleRevoke}>
                Отозвать ссылку
              </button>
            ) : (
              <button className="btn" onClick={toggleRevoke}>
                Восстановить ссылку
              </button>
            )}
            <button className="btn ghost text-xs" onClick={refresh}>
              Обновить статус
            </button>
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
