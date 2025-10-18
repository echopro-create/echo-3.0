"use client";

import { useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UploadItem = {
  name: string;
  size: number;
  type: string;
  progress: "idle" | "uploading" | "done" | "error";
  error?: string | null;
  path?: string;
};

const ACCEPT = [
  "text/plain",
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "video/mp4",
  "video/webm",
].join(",");

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB, не музей, но и не свалка

export function Uploader({ messageId }: { messageId: string }) {
  const s = createClient();

  const inputId = useId();
  const hintId = useId();
  const statusId = useId();

  const [items, setItems] = useState<UploadItem[]>([]);
  const [globalErr, setGlobalErr] = useState<string | null>(null);
  const [globalOk, setGlobalOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    setGlobalErr(null);
    setGlobalOk(null);

    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    // Инициализируем список
    const nextItems: UploadItem[] = Array.from(fileList).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      progress: "idle",
    }));
    setItems(nextItems);

    // Предзагрузим текущие вложения, чтобы не затирать
    const { data: msgRow, error: msgErr } = await s
      .from("messages")
      .select("content")
      .eq("id", messageId)
      .single<{
        content: {
          attachments?: Array<{
            path: string;
            name: string;
            size: number;
            type: string;
          }>;
        };
      }>();

    if (msgErr) {
      setGlobalErr(`Не удалось получить текущее состояние: ${msgErr.message}`);
      return;
    }

    const currentAttachments = msgRow?.content?.attachments ?? [];

    setBusy(true);
    try {
      const uploaded: Array<{
        path: string;
        name: string;
        size: number;
        type: string;
      }> = [];

      // Последовательная загрузка, чтобы не упереться в лимиты
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        // Валидация
        if (file.size > MAX_SIZE_BYTES) {
          setItems((prev) => {
            const copy = [...prev];
            copy[i] = {
              ...copy[i],
              progress: "error",
              error: "Файл слишком большой (лимит 25 MB)",
            };
            return copy;
          });
          continue;
        }
        if (ACCEPT && !ACCEPT.split(",").includes(file.type)) {
          setItems((prev) => {
            const copy = [...prev];
            copy[i] = {
              ...copy[i],
              progress: "error",
              error: "Неподдерживаемый тип файла",
            };
            return copy;
          });
          continue;
        }

        // Обновим статус
        setItems((prev) => {
          const copy = [...prev];
          copy[i] = { ...copy[i], progress: "uploading" };
          return copy;
        });

        const ext = (() => {
          const parts = file.name.split(".");
          return parts.length > 1 ? parts.pop() : "";
        })();
        const safeExt = ext && /^[a-zA-Z0-9]+$/.test(ext) ? ext : "bin";
        const path = `${messageId}/${crypto.randomUUID()}.${safeExt}`;

        const { error: upErr } = await s.storage
          .from("attachments")
          .upload(path, file, {
            upsert: false,
          });

        if (upErr) {
          setItems((prev) => {
            const copy = [...prev];
            copy[i] = { ...copy[i], progress: "error", error: upErr.message };
            return copy;
          });
          continue;
        }

        uploaded.push({
          path,
          name: file.name,
          size: file.size,
          type: file.type,
        });

        setItems((prev) => {
          const copy = [...prev];
          copy[i] = { ...copy[i], progress: "done", path };
          return copy;
        });
      }

      if (uploaded.length > 0) {
        const nextAttachments = [...currentAttachments, ...uploaded];
        const { error: updErr } = await s
          .from("messages")
          .update({ content: { attachments: nextAttachments } })
          .eq("id", messageId);

        if (updErr) {
          setGlobalErr(
            `Загружено, но не удалось обновить запись: ${updErr.message}`,
          );
        } else {
          setGlobalOk("Файлы загружены.");
        }
      } else if (!globalErr) {
        // Ничего не загрузилось
        setGlobalErr("Ни один файл не был загружен.");
      }
    } catch {
      setGlobalErr(
        "Не удалось загрузить файлы. Проверьте соединение и попробуйте ещё раз.",
      );
    } finally {
      setBusy(false);
      // Сброс input, чтобы можно было выбрать те же файлы повторно
      e.target.value = "";
    }
  }

  return (
    <div
      className="rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm"
      aria-busy={busy}
      aria-describedby={statusId}
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium">
          Вложения
        </label>
        <span id={hintId} className="text-xs opacity-70">
          До 25 MB; {ACCEPT.split(",").slice(0, 5).join(", ")}, …
        </span>
      </div>

      <input
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={onFiles}
        className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-[var(--ring)] file:bg-transparent file:px-3 file:py-2
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg"
        aria-describedby={hintId}
      />

      {/* Список текущих загрузок/результатов */}
      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((it) => (
            <li
              key={`${it.name}-${it.path ?? it.progress}`}
              className="rounded-xl border border-[var(--ring)] p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate">{it.name}</div>
                  <div className="text-xs opacity-60">
                    {(it.size / (1024 * 1024)).toFixed(1)} MB ·{" "}
                    {it.type || "application/octet-stream"}
                  </div>
                </div>
                <div className="text-xs">
                  {it.progress === "uploading" && <span>Загрузка…</span>}
                  {it.progress === "done" && (
                    <span className="text-green-600">Готово</span>
                  )}
                  {it.progress === "error" && (
                    <span className="text-red-600">Ошибка</span>
                  )}
                </div>
              </div>
              {it.error && (
                <div className="mt-1 text-xs text-red-600">{it.error}</div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Глобальные статусы для скринридеров */}
      <p id={statusId} aria-live="polite" className="sr-only">
        {busy
          ? "Идёт загрузка…"
          : globalOk
            ? "Файлы загружены"
            : globalErr
              ? "Ошибка загрузки"
              : ""}
      </p>

      {globalOk && <p className="mt-3 text-sm text-green-600">{globalOk}</p>}
      {globalErr && <p className="mt-3 text-sm text-red-600">{globalErr}</p>}
    </div>
  );
}
