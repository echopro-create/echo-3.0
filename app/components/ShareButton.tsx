"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ShareButton({
  messageId,
  defaultDays = 7,
}: {
  messageId: string;
  defaultDays?: number;
}) {
  const router = useRouter();
  const [making, setMaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [days, setDays] = useState<number>(defaultDays);

  async function make() {
    if (making) return; // защита от дабл-клика
    setMaking(true);
    setError(null);
    try {
      const res = await fetch("/api/shares", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: messageId, ttl_days: days }),
      });

      const j = await res.json().catch(() => ({} as any));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Не удалось создать ссылку");

      // Показать URL сразу…
      setUrl(j.url as string);
      // …и обновить серверный рендер страницы, чтобы блок «Публичная ссылка» увидел новую запись
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Ошибка");
    } finally {
      setMaking(false);
    }
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // молчим, браузеры иногда вредничают
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="number"
        min={1}
        max={30}
        value={days}
        onChange={(e) =>
          setDays(Math.max(1, Math.min(30, Number(e.target.value || 1))))
        }
        className="border rounded-xl px-2 py-1 w-20 text-sm"
        title="Срок в днях"
      />
      <button className="btn secondary" type="button" onClick={make} disabled={making}>
        {making ? "Создаём…" : "Создать публичную ссылку"}
      </button>

      {url && (
        <div className="flex items-center gap-2">
          <input
            className="border rounded-xl px-2 py-1 text-sm w-[360px]"
            value={url}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
          />
          <button className="btn" type="button" onClick={copy}>
            Копировать
          </button>
        </div>
      )}

      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
