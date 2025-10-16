"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DeliveryMode = "date" | "event" | "pulse";

type NewMessagePayload = {
  title: string;
  mode: DeliveryMode;
  status: "draft";
  content: Record<string, unknown>;
  deliver_at?: string | null;
  pulse_interval?: string | null;
};

export default function NewMessagePage() {
  const [title, setTitle] = useState<string>("");
  const [mode, setMode] = useState<DeliveryMode>("date");
  const [deliverAt, setDeliverAt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();

  const titleId = useId();
  const modeId = useId();
  const dateId = useId();
  const helpId = useId();
  const errId = useId();
  const okId = useId();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setErr(null);

    // простая валидация до запроса
    if (!title.trim()) {
      setErr("Укажите заголовок послания.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      const payload: NewMessagePayload = {
        title: title.trim(),
        mode,
        status: "draft",
        content: {},
      };

      if (mode === "date") {
        // datetime-local возвращает локальное время без TZ, приводим к ISO (UTC)
        payload.deliver_at = deliverAt ? new Date(deliverAt).toISOString() : null;
      }

      const { data, error } = await supabase
        .from("messages")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        setErr(error.message);
        return;
      }

      // успех
      router.replace(`/messages/${data.id}`);
    } catch {
      setErr("Не удалось создать черновик. Проверьте соединение и попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Новое послание</h1>
      <p id={helpId} className="mb-6 opacity-80">
        Сначала черновик. Вложения и адресатов добавите на следующем шаге.
      </p>

      <form
        onSubmit={onSubmit}
        noValidate
        aria-describedby={err ? errId : helpId}
        className="space-y-4 rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm"
      >
        {/* Заголовок */}
        <div className="grid gap-2">
          <label htmlFor={titleId} className="text-sm font-medium">
            Заголовок
          </label>
          <input
            id={titleId}
            name="title"
            type="text"
            required
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Письмо детям на 2030"
            className="w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2 outline-none
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-invalid={!!err || undefined}
          />
        </div>

        {/* Способ доставки */}
        <div className="grid gap-2">
          <label htmlFor={modeId} className="text-sm font-medium">
            Способ доставки
          </label>
          <select
            id={modeId}
            name="mode"
            value={mode}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMode(e.target.value as DeliveryMode)}
            className="w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <option value="date">По дате</option>
            <option value="event">По событию</option>
            <option value="pulse">По «пульсу»</option>
          </select>
          <p className="text-xs opacity-70">
            По дате, по внешнему событию или по «пульсу» (dead-man-switch).
          </p>
        </div>

        {/* Дата/время для режима "date" */}
        {mode === "date" && (
          <div className="grid gap-2">
            <label htmlFor={dateId} className="text-sm font-medium">
              Дата и время (локально, будет сохранено в UTC)
            </label>
            <input
              id={dateId}
              name="deliverAt"
              type="datetime-local"
              value={deliverAt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliverAt(e.target.value)}
              className="w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            />
            <p className="text-xs opacity-70">
              Учитывайте часовой пояс устройства. В базе время будет храниться в ISO-UTC.
            </p>
          </div>
        )}

        {/* Кнопка */}
        <button
          type="submit"
          disabled={loading || !title.trim()}
          aria-busy={loading}
          className="w-full inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium
                     bg-[color:var(--fg)] text-[color:var(--bg)]
                     hover:opacity-90 disabled:opacity-50
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {loading ? "Создаём…" : "Создать черновик"}
        </button>

        {/* Ошибки */}
        {err && (
          <p
            id={errId}
            role="alert"
            aria-live="assertive"
            className="text-sm text-red-600"
          >
            {err}
          </p>
        )}

        {/* Сообщение об успехе здесь не показываем, т.к. сразу редиректим */}
        <span id={okId} className="sr-only">Создано</span>
      </form>
    </main>
  );
}
