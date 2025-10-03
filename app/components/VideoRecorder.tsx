"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/app/lib/i18n";

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
  "video/mp4",
];

function isTypeSupported(mime: string) {
  return typeof window !== "undefined"
    && (window as any).MediaRecorder
    && (window.MediaRecorder as any).isTypeSupported
    ? (window.MediaRecorder as any).isTypeSupported(mime)
    : false;
}

function pickSupportedVideoMime(): string | null {
  for (const m of VIDEO_CANDIDATES) if (isTypeSupported(m)) return m;
  return null;
}

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < MB) return `${(n / 1024).toFixed(1)} KB`;
  if (n < MB * 1024) return `${(n / MB).toFixed(1)} MB`;
  return `${(n / (MB * 1024)).toFixed(1)} GB`;
}

type UiState = "idle" | "recording" | "stopped" | "uploading" | "success" | "error" | "canceled";

export default function VideoRecorder({
  messageId,
  maxBytes = 100 * MB,
  maxDurationSec = 7 * 60,
  onUploaded,
  title = "Видеопослание",
}: VideoRecorderProps) {
  const t = useT();
  const [supported, setSupported] = useState(false);
  const [mime, setMime] = useState<string | null>(null);

  const [ui, setUi] = useState<UiState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [duration, setDuration] = useState(0);
  const durationTimerRef = useRef<number | null>(null);

  const [chunks, setChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ЕДИНЫЙ <video>
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);

  const [uploadPct, setUploadPct] = useState<number>(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const stopBtnRef = useRef<HTMLButtonElement | null>(null);

  const blobForUpload = useMemo(() => {
    if (!chunks.length) return null;
    return new Blob(chunks, { type: mime || "video/webm" });
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
    return () => { if (durationTimerRef.current) clearInterval(durationTimerRef.current); };
  }, [ui]);

  useEffect(() => {
    if (ui === "recording" && duration >= maxDurationSec) stopRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, maxDurationSec, ui]);

  const revokePlaybackUrl = useCallback(() => {
    if (playbackUrl) {
      URL.revokeObjectURL(playbackUrl);
      setPlaybackUrl(null);
    }
  }, [playbackUrl]);

  const resetAll = useCallback(() => {
    setUi("idle");
    setError(null);
    setDuration(0);
    setChunks([]);
    setUploadPct(0);
    // возвращаем единый <video> в пустое состояние
    if (videoElRef.current) {
      try { videoElRef.current.pause(); } catch {}
      videoElRef.current.removeAttribute("src");
      (videoElRef.current as any).srcObject = null;
      videoElRef.current.load();
    }
    revokePlaybackUrl();
  }, [revokePlaybackUrl]);

  async function startRecording() {
    try {
      setError(null);
      revokePlaybackUrl(); // если было предыдущее превью — убрать
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;

      if (videoElRef.current) {
        (videoElRef.current as any).srcObject = stream;
        videoElRef.current.muted = true;      // live-превью без эха
        videoElRef.current.controls = false;  // во время записи — без контролов
        await videoElRef.current.play().catch(() => {});
      }

      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mediaRecorderRef.current = mr;
      setChunks([]);
      setDuration(0);

      mr.ondataavailable = (ev) => { if (ev.data && ev.data.size > 0) setChunks((prev) => prev.concat(ev.data)); };

      mr.onstop = async () => {
        // останавливаем стрим
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        // переключаем единый <video> на записанный файл
        if (videoElRef.current) {
          (videoElRef.current as any).srcObject = null;
          videoElRef.current.muted = false;
          videoElRef.current.controls = true;

          const blob = new Blob(chunks, { type: mime || "video/webm" });
          const url = URL.createObjectURL(blob);
          setPlaybackUrl(url);
          videoElRef.current.src = url;
          // автоплей не навязываем, чтобы не бесить пользователя
        }

        setUi("stopped");
      };

      mr.onerror = (ev: any) => {
        setError(ev?.error?.message || "Ошибка записи видео");
        try { stream.getTracks().forEach((t) => t.stop()); } catch {}
        if (videoElRef.current) {
          try { videoElRef.current.pause(); } catch {}
          (videoElRef.current as any).srcObject = null;
          videoElRef.current.controls = false;
        }
        setUi("error");
      };

      mr.start(1000);
      setUi("recording");
      setTimeout(() => stopBtnRef.current?.focus(), 0);
    } catch (e: any) {
      setError(e?.message || "Не удалось начать запись (доступ к камере/микрофону?)");
      setUi("error");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (videoElRef.current && (videoElRef.current as any).srcObject) {
      try { videoElRef.current.pause(); } catch {}
      (videoElRef.current as any).srcObject = null;
    }
  }

  function discardRecording() {
    try { xhrRef.current?.abort(); } catch {}
    xhrRef.current = null;

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
    if (!blobForUpload) { setError("Нет данных записи"); setUi("error"); return; }
    const blob = blobForUpload;
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
    setUploadPct(0);

    try {
      const form = new FormData();
      form.append("file", file);
      if (messageId) form.append("message_id", messageId);

      const res = await xhrUpload(
        "/api/media/upload",
        form,
        (loaded, total) => { if (total > 0) setUploadPct(Math.min(99, Math.round((loaded / total) * 100))); },
        (xhr) => { xhrRef.current = xhr; }
      );

      setUploadPct(100);

      if (!res.ok) {
        setError(res.error || "Ошибка загрузки");
        setUi("error");
        return;
      }

      setUi("success");
      onUploaded?.(res);
    } catch (e: any) {
      if (e?.message === "__aborted__") {
        setUi("canceled");
        setError("Загрузка отменена");
      } else {
        setError(e?.message || "Сбой загрузки");
        setUi("error");
      }
    } finally {
      xhrRef.current = null;
    }
  }

  const recording = ui === "recording";
  const uploading = ui === "uploading";

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <strong>{title}</strong>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          {t.limit}: {fmtBytes(maxBytes)} • {mime ? mime : t.defaultFormat} • {Math.floor(maxDurationSec/60)} мин
        </span>
      </div>

      {!supported && (
        <div className="muted" role="alert">
          {t.browserNoSupportVideo}
        </div>
      )}

      {supported && (
        <>
          {/* ЕДИНЫЙ <video>: live во время записи, потом — проигрывание записи */}
          <video
            ref={videoElRef}
            playsInline
            style={{ width: "100%", background: "#000", borderRadius: 12 }}
            preload="metadata"
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn"
              type="button"
              onClick={startRecording}
              disabled={recording || uploading}
              aria-disabled={recording || uploading}
              aria-label={t.record}
            >
              {t.record}
            </button>

            <button
              ref={stopBtnRef}
              className="btn danger"
              type="button"
              onClick={stopRecording}
              disabled={!recording || uploading}
              aria-disabled={!recording || uploading}
              aria-label={t.stop}
            >
              {t.stop}
            </button>

            <button
              className="btn secondary"
              type="button"
              onClick={discardRecording}
              disabled={recording || uploading}
              aria-disabled={recording || uploading}
              aria-label={t.reset}
            >
              {t.reset}
            </button>

            <button
              className="btn"
              type="button"
              onClick={uploadRecording}
              disabled={uploading || recording || !blobForUpload}
              aria-disabled={uploading || recording || !blobForUpload}
              aria-label={t.upload}
            >
              {t.upload}
            </button>

            {uploading && (
              <button
                className="btn secondary"
                type="button"
                onClick={() => { try { xhrRef.current?.abort(); } catch {} }}
                aria-label={t.cancelUpload}
              >
                {t.cancelUpload}
              </button>
            )}
          </div>

          <div style={{ fontSize: 13, opacity: 0.85 }} aria-live="polite">
            {recording && <span>{t.recording} {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}</span>}
            {uploading && <span>{t.uploading} {uploadPct}%</span>}
            {ui === "success" && <span>{t.ready}</span>}
            {ui === "stopped" && !recording && playbackUrl && <span>{t.stopped}</span>}
            {ui === "canceled" && <span>{t.canceled}</span>}
            {ui === "error" && <span>{t.error}: {error}</span>}
          </div>

          {uploading && (
            <div
              aria-label="progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={uploadPct}
              style={{ width: "100%", height: 6, background: "#eee", borderRadius: 6 }}
            >
              <div style={{ width: `${uploadPct}%`, height: "100%", borderRadius: 6 }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function xhrUpload(
  url: string,
  form: FormData,
  onProgress?: (loaded: number, total: number) => void,
  onInit?: (xhr: XMLHttpRequest) => void
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    onInit?.(xhr);
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(e.loaded, e.total); };
    xhr.responseType = "json";
    xhr.onerror = () => reject(new Error("Сетевая ошибка"));
    xhr.onabort = () => reject(new Error("__aborted__"));
    xhr.onload = () => {
      const status = xhr.status;
      const json = xhr.response as UploadResponse | null;
      if (!json) return resolve({ ok: false, error: `Пустой ответ (${status})` });
      resolve(json);
    };
    xhr.send(form);
  });
}
