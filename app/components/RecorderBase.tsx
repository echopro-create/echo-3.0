"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * RecorderBase
 * Запись аудио через MediaRecorder, предпрослушивание, размерные лимиты,
 * прогресс аплоада в /api/media/upload и аккуратные статусы.
 *
 * Пример использования:
 * <RecorderBase messageId={message.id} onUploaded={(res) => { console.log(res); }} />
 */

type UploadResponse = {
  ok: boolean;
  id?: string | null;
  path?: string;
  mime?: string;
  bytes?: number;
  category?: "audio" | "video" | "other";
  error?: string;
};

export type RecorderBaseProps = {
  /** Привязка к существующему сообщению; если пусто — файл просто улетит в Storage без записи в БД */
  messageId?: string;
  /** Максимальный размер файла в байтах (по умолчанию 25 МБ) */
  maxBytes?: number;
  /** Максимальная длительность записи в секундах (по умолчанию 30 минут) */
  maxDurationSec?: number;
  /** Коллбек после успешной загрузки */
  onUploaded?: (res: UploadResponse) => void;
  /** Кастомный заголовок блока */
  title?: string;
};

const MB = 1024 * 1024;

// Кандидаты форматов по убыванию предпочтения
const AUDIO_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4", // контейнер m4a/aac; MediaRecorder поддерживается не везде
];

/** Проверяем, что браузер умеет конкретный mime для MediaRecorder */
function isTypeSupported(mime: string) {
  // @ts-ignore
  return typeof window !== "undefined" && window.MediaRecorder && (window.MediaRecorder as any).isTypeSupported
    ? (window.MediaRecorder as any).isTypeSupported(mime)
    : false;
}

/** Выбираем первый поддерживаемый mime */
function pickSupportedAudioMime(): string | null {
  for (const m of AUDIO_CANDIDATES) {
    if (isTypeSupported(m)) return m;
  }
  // В крайнем случае попробуем без mime — браузер сам подставит
  return null;
}

/** Форматирует байты в человекочитаемый вид */
function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < MB) return `${(n / 1024).toFixed(1)} KB`;
  if (n < MB * 1024) return `${(n / MB).toFixed(1)} MB`;
  return `${(n / (MB * 1024)).toFixed(1)} GB`;
}

/** Простой класс состояний UI */
type UiState = "idle" | "recording" | "stopped" | "uploading" | "success" | "error";

export default function RecorderBase({
  messageId,
  maxBytes = 25 * MB,
  maxDurationSec = 30 * 60,
  onUploaded,
  title = "Голосовое послание",
}: RecorderBaseProps) {
  const [supported, setSupported] = useState<boolean>(false);
  const [mime, setMime] = useState<string | null>(null);

  const [ui, setUi] = useState<UiState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [duration, setDuration] = useState<number>(0);
  const durationTimerRef = useRef<number | null>(null);

  const [chunks, setChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const audioUrl = useMemo(() => {
    if (!chunks.length) return null;
    const blob = new Blob(chunks, { type: mime || "audio/webm" });
    return URL.createObjectURL(blob);
  }, [chunks, mime]);

  // Проверка доступности MediaRecorder и выбор mime
  useEffect(() => {
    const has = typeof window !== "undefined" && "MediaRecorder" in window;
    setSupported(has);
    setMime(pickSupportedAudioMime());
  }, []);

  // Таймер длительности записи
  useEffect(() => {
    if (ui === "recording") {
      durationTimerRef.current = window.setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000) as unknown as number;
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [ui]);

  // Остановка при превышении лимита длительности
  useEffect(() => {
    if (ui === "recording" && duration >= maxDurationSec) {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, maxDurationSec, ui]);

  const resetAll = useCallback(() => {
    setUi("idle");
    setError(null);
    setDuration(0);
    setChunks([]);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  async function startRecording() {
    try {
      setError(null);

      // Доступ к микрофону
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Создаем рекордер
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mediaRecorderRef.current = mr;
      setChunks([]);
      setDuration(0);

      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          setChunks((prev) => prev.concat(ev.data));
        }
      };

      mr.onstop = () => {
        // Останавливаем все дорожки
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setUi("stopped");
      };

      mr.onerror = (ev: any) => {
        setError(ev?.error?.message || "Ошибка записи");
        try {
          stream.getTracks().forEach((t) => t.stop());
        } catch {}
        setUi("error");
      };

      mr.start(1000); // чанки раз в секунду, чтобы UI был отзывчивым
      setUi("recording");
    } catch (e: any) {
      setError(e?.message || "Не удалось начать запись (доступ к микрофону?)");
      setUi("error");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  function discardRecording() {
    // Полный сброс
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    resetAll();
  }

  async function uploadRecording() {
    if (!chunks.length) {
      setError("Нет данных записи");
      setUi("error");
      return;
    }

    const blob = new Blob(chunks, { type: mime || "audio/webm" });
    const size = blob.size;

    if (size > maxBytes) {
      setError(`Файл ${fmtBytes(size)} превышает лимит ${fmtBytes(maxBytes)}`);
      setUi("error");
      return;
    }

    const filename = `audio_${new Date().toISOString().replace(/[:.]/g, "-")}.${(mime || "audio/webm").includes("mp4") ? "m4a" : "webm"}`;
    const file = new File([blob], filename, { type: mime || "audio/webm" });

    // Для прогресса используем XHR
    setUi("uploading");
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);
      if (messageId) form.append("message_id", messageId);

      const res = await xhrUpload("/api/media/upload", form, (/* loaded, total */) => {
        // можно расширить отображение прогресса
      });

      if (!res.ok) {
        setError(res.error || "Ошибка загрузки");
        setUi("error");
        return;
      }

      setUi("success");
      onUploaded?.(res);
    } catch (e: any) {
      setError(e?.message || "Сбой загрузки");
      setUi("error");
    }
  }

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <strong>{title}</strong>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          Лимит: {fmtBytes(maxBytes)} • {mime ? mime : "формат по умолчанию"}
        </span>
      </div>

      {!supported && (
        <div className="muted" role="alert">
          Ваш браузер не поддерживает MediaRecorder.
        </div>
      )}

      {supported && (
        <>
          {/* Контролы записи */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ui !== "recording" && (
              <button className="btn" type="button" onClick={startRecording}>
                Записать
              </button>
            )}
            {ui === "recording" && (
              <button className="btn danger" type="button" onClick={stopRecording}>
                Остановить
              </button>
            )}
            {(ui === "stopped" || ui === "error" || ui === "success") && (
              <button className="btn secondary" type="button" onClick={discardRecording}>
                Сбросить
              </button>
            )}
            {ui === "stopped" && (
              <button className="btn" type="button" onClick={uploadRecording}>
                Загрузить
              </button>
            )}
          </div>

          {/* Индикация состояния */}
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            {ui === "recording" && (
              <span>Идёт запись… {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}</span>
            )}
            {ui === "uploading" && <span>Загрузка…</span>}
            {ui === "success" && <span>Готово. Файл сохранён.</span>}
            {ui === "stopped" && <span>Запись остановлена. Можно прослушать и загрузить.</span>}
            {ui === "error" && <span>Ошибка: {error}</span>}
          </div>

          {/* Предпрослушивание */}
          {audioUrl && (
            <audio
              src={audioUrl}
              controls
              style={{ width: "100%", marginTop: 8 }}
              preload="metadata"
            />
          )}
        </>
      )}
    </div>
  );
}

/**
 * Загрузка через XHR для получения uploadProgress (fetch в браузерах пока без onprogress для body)
 */
function xhrUpload(url: string, form: FormData, onProgress?: (loaded: number, total: number) => void): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded, e.total);
    };
    xhr.responseType = "json";
    xhr.onerror = () => reject(new Error("Сетевая ошибка"));
    xhr.onload = () => {
      const status = xhr.status;
      const json = xhr.response as UploadResponse | null;
      if (!json) return resolve({ ok: false, error: `Пустой ответ (${status})` });
      resolve(json);
    };
    xhr.send(form);
  });
}
