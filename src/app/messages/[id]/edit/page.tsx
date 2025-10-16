"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Uploader } from "@/components/uploader";

type DeliveryMode = "date" | "event" | "pulse";
type Status = "draft" | "scheduled" | "sent";

export default function MessageEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const s = createClient();

  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<DeliveryMode>("date");
  const [status, setStatus] = useState<Status>("draft");
  const [deliverAt, setDeliverAt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await s
        .from("messages")
        .select("title, mode, status, deliver_at")
        .eq("id", id)
        .maybeSingle();
      if (!mounted) return;
      if (error) { setErr(error.message); setLoading(false); return; }
      if (data) {
        setTitle(data.title);
        setMode(data.mode as DeliveryMode);
        setStatus(data.status as Status);
        setDeliverAt(data.deliver_at ? new Date(data.deliver_at).toISOString().slice(0,16) : "");
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id, s]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const payload: Record<string, unknown> = {
      title, mode, status,
      deliver_at: mode === "date" && deliverAt ? new Date(deliverAt).toISOString() : null
    };
    const { error } = await s.from("messages").update(payload).eq("id", id);
    if (error) { setErr(error.message); return; }
    router.replace(`/messages/${id}`);
  }

  async function onDelete() {
    if (!confirm("Удалить послание безвозвратно?")) return;
    const { error } = await s.from("messages").delete().eq("id", id);
    if (error) { setErr(error.message); return; }
    router.replace("/messages");
  }

  if (loading) return <main className="mx-auto max-w-xl px-4 py-16">Загрузка…</main>;

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Редактирование</h1>

      {/* ФОРМА — как была */}
      <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm">
        <label className="block text-sm">
          Заголовок
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          Режим доставки
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as DeliveryMode)}
            className="mt-1 w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2"
          >
            <option value="date">По дате</option>
            <option value="event">По событию</option>
            <option value="pulse">По «пульсу»</option>
          </select>
        </label>

        {mode === "date" && (
          <label className="block text-sm">
            Дата и время (UTC)
            <input
              type="datetime-local"
              value={deliverAt}
              onChange={(e) => setDeliverAt(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2"
            />
          </label>
        )}

        {err && <p className="text-sm text-red-600">{err}</p>}

        <div className="flex gap-3">
          <button type="submit" className="rounded-xl border border-[var(--ring)] px-4 py-2 text-sm opacity-90 hover:opacity-100">
            Сохранить
          </button>
          <button type="button" onClick={onDelete} className="rounded-xl border border-[var(--ring)] px-4 py-2 text-sm opacity-90 hover:opacity-100">
            Удалить
          </button>
        </div>
      </form>

      {/* ВОТ СЮДА ВСТАВЛЕНО — блок с аплоадером сразу ПОСЛЕ формы */}
      <div className="mt-8">
        <div className="mb-2 text-sm opacity-60">Вложения</div>
        <Uploader messageId={String(id)} />
      </div>
    </main>
  );
}
