"use client";

import { useEffect, useId, useState } from "react";
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
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // a11y ids
  const titleId = useId();
  const modeId = useId();
  const dateId = useId();
  const statusId = useId();
  const helpId = useId();
  const errId = useId();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await s
        .from("messages")
        .select("title, mode, status, deliver_at")
        .eq("id", id)
        .maybeSingle();
      if (!mounted) return;
      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }
      if (data) {
        setTitle(data.title ?? "");
        setMode((data.mode as DeliveryMode) ?? "date");
        setStatus((data.status as Status) ?? "draft");
        setDeliverAt(
          data.deliver_at ? new Date(data.deliver_at).toISOString().slice(0, 16) : ""
        );
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id, s]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setErr(null);
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        mode,
        status,
        deliver_at: mode === "date" && deliverAt ? new Date(deliverAt).toISOString() : null,
      };
      const { error } = await s.from("messages").update(payload).eq("id", id);
      if (error) {
        setErr(error.message);
        return;
      }
      router.replace(`/messages/${id}`);
    } catch {
      setErr("Не удалось сохранить изменения. Проверьте соединение и попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("Удалить послание безвозвратно?")) return;
    setSaving(true);
    setErr(null);
    try {
      const { error } = await s.from("messages").delete().eq("id", id);
      if (error) {
        setErr(error.message);
        return;
      }
      router.replace("/messages");
    } catch {
      setErr("Не удалось удалить послание. Проверьте соединение и попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16" role="status" aria-live="polite">
        Загрузка…
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Редактирование</h1>
      <p id={helpId} className="mb-6 opacity-80">
        Обновите данные послания и прикрепите вложения. Изменения сохраняются только после нажатия «Сохранить».
      </p>

      <form
        onSubmit={onSave}
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
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Письмо детям на 2030"
            className="w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2 outline-none
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          />
        </div>

        {/* Режим доставки */}
        <div className="grid gap-2">
          <label htmlFor={modeId} className="text-sm font-medium">
            Режим доставки
          </label>
          <select
            id={modeId}
            value={mode}
            onChange={(e) => setMode(e.target.value as DeliveryMode)}
            className="w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <option value="date">По дате</option>
            <option value="event">По событию</option>
            <option value="pulse">По «пульсу»</option>
          </select>
        </div>

        {/* Дата/время для режима "date" */}
        {mode === "date" && (
          <div className="grid gap-2">
            <label htmlFor={dateId} className="text-sm font-medium">
              Дата и время (локально, будет сохранено в UTC)
            </label>
            <input
              id={dateId}
              type="datetime-local"
              value={deliverAt}
              onChange={(e) => setDeliverAt(e.target.value)}
              className="w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            />
            <p className="text-xs opacity-70">
              Проверьте часовой пояс устройства. В базе хранится ISO-UTC.
            </p>
          </div>
        )}

        {/* Статус (для полноты редактора) */}
        <div className="grid gap-2">
          <label htmlFor={statusId} className="text-sm font-medium">
            Статус
          </label>
          <select
            id={statusId}
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <option value="draft">Черновик</option>
            <option value="scheduled">Запланировано</option>
            <option value="sent">Отправлено</option>
          </select>
        </div>

        {/* Ошибки */}
        {err && (
          <p id={errId} role="alert" aria-live="assertive" className="text-sm text-red-600">
            {err}
          </p>
        )}

        {/* Кнопки действий */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            aria-busy={saving}
            className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium
                       bg-[color:var(--fg)] text-[color:var(--bg)]
                       hover:opacity-90 disabled:opacity-50
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {saving ? "Сохраняем…" : "Сохранить"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium
                       ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Удалить
          </button>
        </div>
      </form>

      {/* Вложения */}
      <section className="mt-8" aria-labelledby="attachments-title">
        <h2 id="attachments-title" className="mb-2 text-sm opacity-60">
          Вложения
        </h2>
        <Uploader messageId={String(id)} />
      </section>
    </main>
  );
}
