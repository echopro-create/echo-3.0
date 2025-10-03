// Единая точка правды по лимитам и белым спискам

export const BYTES = {
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024
};

export const LIMITS = {
  audioMax: 25 * BYTES.MB,
  videoMax: 100 * BYTES.MB,
  fileMax: 50 * BYTES.MB
};

// Разрешённые MIME
export const ALLOW = {
  audio: [
    "audio/webm",
    "audio/webm;codecs=opus",
    "audio/ogg",
    "audio/ogg;codecs=opus",
    "audio/mpeg",        // mp3
    "audio/mp4",         // m4a/aac контейнер
    "audio/aac",
    "audio/wav"
  ],
  video: [
    "video/webm",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9,opus",
    "video/mp4",         // h264/aac
  ],
  other: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "text/plain"
  ]
} as const;

// Нормализуем "video/webm;codecs=vp9,opus" -> "video/webm"
export function normalizeMime(mime: string | null | undefined): string {
  if (!mime) return "application/octet-stream";
  const lower = mime.toLowerCase();
  if (lower.startsWith("audio/webm")) return "audio/webm";
  if (lower.startsWith("video/webm")) return "video/webm";
  if (lower.startsWith("video/mp4")) return "video/mp4";
  if (lower.startsWith("audio/ogg")) return "audio/ogg";
  if (lower.startsWith("audio/mpeg")) return "audio/mpeg";
  if (lower.startsWith("audio/mp4")) return "audio/mp4";
  if (lower.startsWith("image/jpeg")) return "image/jpeg";
  if (lower.startsWith("image/png")) return "image/png";
  if (lower.startsWith("image/webp")) return "image/webp";
  if (lower.startsWith("application/pdf")) return "application/pdf";
  if (lower.startsWith("text/plain")) return "text/plain";
  return lower;
}

export type Category = "audio" | "video" | "other";

export function detectCategory(mime: string): Category {
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  return "other";
}

export function isAllowed(mime: string): boolean {
  const cat = detectCategory(mime);
  const white = cat === "audio" ? ALLOW.audio : cat === "video" ? ALLOW.video : ALLOW.other;
  return white.includes(mime);
}

export function maxFor(mime: string): number {
  const cat = detectCategory(mime);
  return cat === "audio" ? LIMITS.audioMax : cat === "video" ? LIMITS.videoMax : LIMITS.fileMax;
}

export function sanitizeName(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 200);
}
