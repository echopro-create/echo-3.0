"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TriggerKind = "datetime" | "event" | "afterlife";
type ContentKind = "text" | "voice" | "video" | "file";
type Recipient = { id: string; value: string };

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function NewMessageForm() {
  const [contentKind, setContentKind] = useState<ContentKind>("text");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [trigger, setTrigger] = useState<TriggerKind>("datetime");
  const [whenISO, setWhenISO] = useState<string>("");
  const [eventCode, setEventCode] = useState("");
  const [afterlifeAck, setAfterlifeAck] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const supabase = createClient();

  const totalBytes = useMemo(
    () => files.reduce((sum, f) => sum + f.size, 0),
    [files],
  );

  function addRecipientFromInput() {
    const v = recipientInput.trim();
    if (!v) return;
    if (!isEmail(v)) {
      setErrors((e) => [...e, `Неверный email: ${v}`]);
      return;
    }
    const exists = recipients.some(
      (r) => r.value.toLowerCase() === v.toLowerCase(),
    );
    if (exists) {
      setErrors((e) => [...e, `Уже есть получатель: ${v}`]);
      return;
    }
    setRecipients((r) => [...r, { id: crypto.randomUUID(), value: v }]);
    setRecipientInput("");
  }

  function removeRecipient(id: string) {
    setRecipients((r) => r.filter((x) => x.id !== id));
  }

  function onFilesPicked(list: FileList | null) {
    if (!list) return;
    const next = Array.from(list);
    const allowed = next.filter((f) => f.size > 0);
    setFiles((prev) => [...prev, ...allowed]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  useEffect(() => {
    if (!recipientInput.endsWith(",")) return;
    const candidate = recipientInput.slice(0, -1);
    if (candidate.trim()) {
      setRecipientInput(candidate);
      addRecipientFromInput();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientInput]);

  function validate(): string[] {
    const errs: string[] = [];
    if (recipients.length === 0)
      errs.push("Добавьте хотя бы одного получателя.");
    switch (contentKind) {
      case "text":
        if (!text.trim()) errs.push("Текст сообщения пустой.");
        break;
      case "voice":
      case "video":
      case "file":
        if (files.length === 0) errs.push("Прикрепите хотя бы один файл.");
        break;
    }
    if (trigger === "datetime") {
      if (!whenISO) errs.push("Укажите дату и время отправки.");
      else {
        const t = new Date(whenISO);
        if (Number.isNaN(t.getTime())) errs.push("Некорректная дата/время.");
        else if (t.getTime() < Date.now() + 60_000)
          errs.push("Время должно быть в будущем.");
      }
    }
    if (trigger === "event" && !eventCode.trim())
      errs.push("Укажите кодовое слово или внешний сигнал.");
    if (trigger === "afterlife" && !afterlifeAck)
      errs.push("Подтвердите понимание механики «после моей смерти».");
    const maxBytes = 500 * 1024 * 1024; // 500 MB
    if (totalBytes > maxBytes)
      errs.push("Суммарный размер файлов превышает 500 МБ.");
    return errs;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setDoneId(null);

    const errs = validate();
    if (errs.length) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    try {
      // 1) Создаём черновик
      const resp = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: contentKind,
          body_text: contentKind === "text" ? text : undefined,
          trigger_kind: trigger,
          send_at:
            trigger === "datetime" ? new Date(whenISO).toISOString() : null,
          event_code: trigger === "event" ? eventCode : null,
          afterlife_ack: trigger === "afterlife" ? afterlifeAck : false,
          recipients: recipients.map((r) => r.value),
        }),
      });
      if (!resp.ok) throw new Error(`API /messages: ${resp.status}`);
      const { id, storagePrefix, status } = await resp.json();
      console.log("message created", { id, status }); // ← та самая строка

      // 2) Если есть файлы — грузим в приватный бакет
      const uploaded: { path: string; mime?: string | null; bytes: number }[] =
        [];
      if (files.length > 0) {
        // Получим текущего юзера ради sanity check пути
        const { data: userData, error: uErr } = await supabase.auth.getUser();
        if (uErr || !userData.user) throw new Error("Нет сессии пользователя");
        for (const f of files) {
          const path = `${storagePrefix}${f.name}`;
          const up = await supabase.storage
            .from("attachments")
            .upload(path.replace(/^attachments\//, ""), f, {
              cacheControl: "3600",
              upsert: false,
            });
          if (up.error) throw up.error;
          uploaded.push({ path, mime: f.type || null, bytes: f.size });
        }

        // 3) Регистрируем вложения в БД
        const resp2 = await fetch(`/api/messages/${id}/attachments`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ files: uploaded }),
        });
        if (!resp2.ok) throw new Error(`API /attachments: ${resp2.status}`);
      }

      setDoneId(id);
      // Немного подчистим форму
      setText("");
      setFiles([]);
      setRecipients([]);
      setRecipientInput("");
    } catch (err) {
      setErrors([
        err instanceof Error ? err.message : "Не удалось сохранить черновик.",
      ]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-8">
      {/* Ошибки */}
      {errors.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-black/10 bg-red-50/70 p-4 text-sm text-red-700"
        >
          <ul className="list-disc pl-5">
            {errors.map((er, i) => (
              <li key={i}>{er}</li>
            ))}
          </ul>
        </div>
      )}
      {doneId && (
        <div
          role="status"
          className="rounded-xl border border-black/10 bg-green-50/70 p-4 text-sm text-green-800"
        >
          Черновик сохранён. ID: <code>{doneId}</code>
        </div>
      )}

      {/* Содержимое */}
      <section className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5">
        <header className="mb-4">
          <h2 className="text-base font-semibold text-[color:var(--fg)]">
            Содержимое
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Выберите формат сообщения и добавьте контент.
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["text", "Текст"],
              ["voice", "Голос"],
              ["video", "Видео"],
              ["file", "Файл"],
            ] as [ContentKind, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setContentKind(key)}
              className={[
                "rounded-lg border px-3 py-1.5 text-sm transition",
                contentKind === key
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white hover:bg-black/[0.03]",
              ].join(" ")}
              aria-pressed={contentKind === key}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {contentKind === "text" && (
            <label className="block text स्म">
              <span className="text-[color:var(--fg)]">Текст сообщения</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="mt-1 w-full resize-y rounded-lg border border-black/10 bg-white/90 p-3 outline-none placeholder:text-[color:var(--muted)] focus:border-black/20"
                placeholder="Напишите то, что должно быть доставлено вовремя."
              />
            </label>
          )}

          {contentKind !== "text" && (
            <div>
              <label className="block text-sm">
                <span className="text-[color:var(--fg)]">Файлы</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={
                    contentKind === "voice"
                      ? "audio/*"
                      : contentKind === "video"
                        ? "video/*"
                        : undefined
                  }
                  onChange={(e) => onFilesPicked(e.target.files)}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-[color:var(--fg)] file:mr-3 file:rounded-md file:border-0 file:bg-black file:px-3 file:py-2 file:text-white"
                />
              </label>
              {files.length > 0 && (
                <div className="mt-3 rounded-lg border border-black/10 bg-black/[0.03] p-3 text-xs text-[color:var(--muted)]">
                  {files.length} файл(ов), всего{" "}
                  {(totalBytes / (1024 * 1024)).toFixed(1)} МБ
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Получатели */}
      <section className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5">
        <header className="mb-4">
          <h2 className="text-base font-semibold text-[color:var(--fg)]">
            Получатели
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Введите email и нажмите Enter. Можно перечислять через запятую.
          </p>
        </header>

        <div className="flex items-center gap-2">
          <input
            type="email"
            value={recipientInput}
            onChange={(e) => setRecipientInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addRecipientFromInput();
              }
            }}
            className="flex-1 rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-sm outline-none placeholder:text-[color:var(--muted)] focus:border-black/20"
            placeholder="user@example.com"
            aria-label="Email получателя"
          />
          <button
            type="button"
            onClick={addRecipientFromInput}
            className="rounded-lg border border-black/10 bg-black px-3 py-2 text-sm text-white transition hover:bg-black/90"
          >
            Добавить
          </button>
        </div>

        {recipients.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {recipients.map((r) => (
              <li
                key={r.id}
                className="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-3 py-1.5 text-xs text-[color:var(--fg)]"
              >
                {r.value}
                <button
                  type="button"
                  onClick={() => removeRecipient(r.id)}
                  className="rounded-full border border-black/10 bg-white px-1.5 py-0.5 text-[10px] opacity-70 transition group-hover:opacity-100"
                  aria-label={`Удалить ${r.value}`}
                  title="Удалить"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Триггер */}
      <section className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5">
        <header className="mb-4">
          <h2 className="text-base font-semibold text-[color:var(--fg)]">
            Триггер доставки
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Когда именно послание должно уйти.
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["datetime", "По дате и времени"],
              ["event", "По событию"],
              ["afterlife", "После моей смерти"],
            ] as [TriggerKind, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTrigger(key)}
              className={[
                "rounded-lg border px-3 py-1.5 text-sm transition",
                trigger === key
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white hover:bg-black/[0.03]",
              ].join(" ")}
              aria-pressed={trigger === key}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {trigger === "datetime" && (
            <label className="block text-sm">
              <span className="text-[color:var(--fg)]">Когда</span>
              <input
                type="datetime-local"
                value={whenISO}
                onChange={(e) => setWhenISO(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 outline-none focus:border-black/20"
              />
            </label>
          )}

          {trigger === "event" && (
            <label className="block text-sm">
              <span className="text-[color:var(--fg)]">Событие/код</span>
              <input
                type="text"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                placeholder="Ключевое слово или внешний сигнал"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 outline-none placeholder:text-[color:var(--muted)] focus:border-black/20"
              />
            </label>
          )}

          {trigger === "afterlife" && (
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={afterlifeAck}
                onChange={(e) => setAfterlifeAck(e.target.checked)}
                className="mt-1"
              />
              <span className="text-[color:var(--muted)]">
                Понимаю, что доставка потребует периодического подтверждения
                «пульсом» и проверок.
              </span>
            </label>
          )}
        </div>
      </section>

      {/* Кнопки */}
      <section className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg border border-black/10 bg-black px-4 py-2 text-sm text-white transition hover:bg-black/90 disabled:opacity-60"
        >
          {saving ? "Сохраняем…" : "Сохранить черновик"}
        </button>
      </section>
    </form>
  );
}
