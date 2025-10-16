"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DeliveryMode = "date" | "event" | "pulse";

type NewMessagePayload = {
  title: string;
  mode: DeliveryMode;
  status: "draft";
  content: Record<string, unknown>;
  deliver_at?: string | null;
  pulse_interval?: string | null; // будем хранить как строковый interval до серверной валидации
};

export default function NewMessagePage() {
  const [title, setTitle] = useState<string>("");
  const [mode, setMode] = useState<DeliveryMode>("date");
  const [deliverAt, setDeliverAt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const supabase = createClient();

    const payload: NewMessagePayload = {
      title,
      mode,
      status: "draft",
      content: {},
    };

    if (mode === "date") {
      payload.deliver_at = deliverAt ? new Date(deliverAt).toISOString() : null;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert(payload)
      .select("id")
      .single();

    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.replace(`/messages/${data.id}`);
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Новое послание</h1>
      <p className="mb-6 opacity-80">Сначала черновик. Детали и вложения добавим на следующем экране.</p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm">
        <label className="block text-sm">
          Заголовок
          <input
            type="text"
            required
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--ring)]"
            placeholder="Письмо детям на 2030"
          />
        </label>

        <label className="block text-sm">
          Способ доставки
          <select
            value={mode}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMode(e.target.value as DeliveryMode)}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliverAt(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2"
            />
          </label>
        )}

        <button
          disabled={loading}
          type="submit"
          className="w-full rounded-xl border border-[var(--ring)] px-4 py-2 text-sm hover:opacity-100 opacity-90"
        >
          {loading ? "Создаём..." : "Создать черновик"}
        </button>

        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
    </main>
  );
}
