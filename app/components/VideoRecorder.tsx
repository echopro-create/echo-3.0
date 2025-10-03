"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UploadResponse = {
  ok: boolean;
  id?: string | null;
  path?: string;
  mime?: string;
  bytes?: number;
  category?: "audio" | "video" | "other";
  error?: string;
};

export type VideoRecorderProps = {
  messageId?: string;
  maxBytes?: number;         // по умолчанию 100 МБ
  maxDurationSec?: number;   // по умолчанию 7 минут
  onUploaded?: (res: UploadResponse) => void;
  title?: string;
};

const MB = 1024 * 1024;

const VIDEO_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4", // часто не поддерживается MediaRecorder'ом; оставим как запасной
];

function isTypeSupported(mime: string) {
  // @ts-ignore
  return typeof window !== "undefined" && (window as any).MediaRecorder && (window.MediaRecorder as any).isTypeSupported
    ? (window.MediaRecorder as any).isTypeSupported(mime)
    : false;
}

function pickSupportedVideoMime(): string | null {
  for (const m of VIDEO_CANDIDATES) {
    if (isTypeSupported(m)) return m;
  }
  return null;
}

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < MB) return `${(n / 1024).toFixed(1)} KB`;
  if (n < MB * 1024) return `${(n / MB).toFixed(1)} MB`;
  return `${(n / (MB * 1024)).toFixed(1)} GB`;
}

type UiState = "idle" | "recording" | "stopped" | "uploading" | "success" | "error";

export default function VideoRecorder({
  messageId,
  maxBytes = 100 * MB,
  maxDurationSec = 7 * 60,
  onUploaded,
  title = "Видеопослание",
}: VideoRecorderProps) {
  const [supported, setSupported] = useState(false);
  const [mime, setMime] = useState<string | null>(null);

  const [ui, setUi] = useState<UiState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [duration, setDuration] = useState(0);
  const durationTimerRef = useRef<number | null>(null);

  const [chunks, setChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const videoUrl = useMemo(() => {
    if (!chunks.length) return null;
    const blob = new Blob(chunks, { type: mime || "video/webm" });
    return URL.createObjectURL(blob);
  }, [chunks, mime]);

  useEffect(() => {
    const has =
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      "MediaRecorder" in window &&
      !!navigator.mediaDevices?.getUserMedia;
    setSupported(Boolean(has));
    setMime(pickSupportedVideoMime());
  }, []);

  useEffect(() => {
    if (ui === "recording") {
      durationTimerRef.current = window.setInterval(() => setDuration((d) => d + 1), 1000) as unknown as number;
    } else if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [ui]);

  useEffect(() => {
    if (ui === "recording" && duration >= maxDurationSec) stopRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, maxDurationSec, ui]);

  const resetAll = useCallback(() => {
    setUi("idle");
    setError(null);
    setDuration(0);
    setChunks([]);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  async function startRecording() {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;

      // Показ предпросмотра live
      if (videoElRef.current) {
        videoElRef.current.srcObject = stream;
        await videoElRef.current.play().catch(() => {});
      }

      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mediaRecorderRef.current = mr;
      setChunks([]);
      setDuration(0);

      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) setChunks((prev) => prev.concat(ev.data));
      };

      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setUi("stopped");
      };

      mr.onerror = (ev: any) => {
        setError(ev?.error?.message || "Ошибка записи видео");
        try {
          stream.getTracks().forEach((t) => t.stop());
        } catch {}
        setUi("error");
      };

      mr.start(1000);
      setUi("recording");
    } catch (e: any) {
      setError(e?.message || "Не удалось начать запись (доступ к камере/микрофону?)");
      setUi("error");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    // Отключим live-превью
    if (videoElRef.current && videoElRef.current.srcObject) {
      videoElRef.current.pause();
      videoElRef.current.srcObject = null;
    }
  }

  function discardRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoElRef.current && videoElRef.current.srcObject) {
      videoElRef.current.pause();
      videoElRef.current.srcObject = null;
    }
    resetAll();
  }

  async function uploadRecording() {
    if (!chunks.length) {
      setError("Нет данных записи");
      setUi("error");
      return;
    }
    const blob = new Blob(chunks, { type: mime || "video/webm" });
    const size = blob.size;

    if (size > maxBytes) {
      setError(`Файл ${fmtBytes(size)} превышает лимит ${fmtBytes(maxBytes)}`);
      setUi("error");
      return;
    }

    const filename = `video_${new Date().toISOString().replace(/[:.]/g, "-")}.${(mime || "video/webm").includes("mp4") ? "mp4" : "webm"}`;
    const file = new File([blob], filename, { type: mime || "video/webm" });

    setUi("uploading");
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);
      if (messageId) form.append("message_id", messageId);

      const res = await xhrUpload("/api/media/upload", form);
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
          Ваш браузер не поддерживает MediaRecorder или getUserMedia.
        </div>
      )}

      {supported && (
        <>
          {/* Live-превью во время записи */}
          <video
            ref={videoElRef}
            muted
            playsInline
            style={{ width: "100%", background: "#000", borderRadius: 12 }}
          />

          {/* Превью записанного видео после остановки */}
          {videoUrl && (
            <video
              src={videoUrl}
              controls
              playsInline
              style={{ width: "100%", background: "#000", borderRadius: 12 }}
              preload="metadata"
            />
          )}

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

          <div style={{ fontSize: 13, opacity: 0.85 }}>
            {ui === "recording" && (
              <span>
                Идёт запись… {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
              </span>
            )}
            {ui === "uploading" && <span>Загрузка…</span>}
            {ui === "success" && <span>Готово. Файл сохранён.</span>}
            {ui === "stopped" && <span>Запись остановлена. Можно просмотреть и загрузить.</span>}
            {ui === "error" && <span>Ошибка: {error}</span>}
          </div>
        </>
      )}
    </div>
  );
}

function xhrUpload(url: string, form: FormData): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
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
