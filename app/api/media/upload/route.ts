import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Лимиты и белые списки.
 * ALLOW_ARCHIVES=true в env включает поддержку zip/7z/rar/tar.
 */
const MB = 1024 * 1024;
const LIMITS = {
  audio: 25 * MB,
  video: 100 * MB,
  other: 50 * MB,
};

const AUDIO_MIME = new Set<string>([
  "audio/webm",
  "audio/ogg",
  "audio/mpeg", // mp3
  "audio/mp4",  // m4a/aac контейнер
  "audio/aac",
  "audio/wav",
]);

const VIDEO_MIME = new Set<string>([
  "video/webm",
  "video/mp4",
]);

const OTHER_BASE = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
] as const;

const ARCHIVE_MIME = [
  "application/zip",
  "application/x-zip-compressed",
  "application/x-7z-compressed",
  "application/x-tar",
  "application/x-rar-compressed",
] as const;

const ALLOW_ARCHIVES = String(process.env.ALLOW_ARCHIVES || "").toLowerCase() === "true";
const OTHER_MIME = new Set<string>([...OTHER_BASE, ...(ALLOW_ARCHIVES ? ARCHIVE_MIME : [])]);

// Нормализация имени файла: безопасные символы + обрезка до 200
function sanitizeFilename(name: string) {
  const clean = (name || "file").replace(/[^\w.\-]+/g, "_");
  return clean.length > 200 ? clean.slice(0, 200) : clean;
}

// Нормализация MIME: нижний регистр, без параметров ;codecs=...
function baseMime(m?: string | null) {
  return (m || "").split(";")[0].trim().toLowerCase();
}

function pickCategory(mime: string): "audio" | "video" | "other" {
  if (AUDIO_MIME.has(mime)) return "audio";
  if (VIDEO_MIME.has(mime)) return "video";
  return "other";
}

function json(status: number, payload: Record<string, unknown>) {
  return NextResponse.json(payload, { status, headers: { "Cache-Control": "no-store" } });
}

function errorJson(status: number, message: string) {
  return json(status, { ok: false, error: message });
}

// Принимаем multipart/form-data: fields: message_id (опц.), file
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  // Авторизация
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user;
  if (userErr || !user) {
    return errorJson(401, "Не авторизован");
  }

  // Парсим форму
  let formData: FormData | null = null;
  try {
    formData = await req.formData();
  } catch {
    return errorJson(400, "Пустой или некорректный multipart/form-data");
  }
  if (!formData) return errorJson(400, "Пустой запрос");

  const file = formData.get("file");
  const messageId = (formData.get("message_id") as string) || null;

  if (!(file instanceof File)) {
    return errorJson(400, "Нет файла");
  }

  // Валидация типа и размера
  const rawMime = file.type || "";
  const mime = baseMime(rawMime); // нормализованный без параметров
  const bytes = typeof file.size === "number" ? file.size : 0;

  const category = pickCategory(mime);
  const limit =
    category === "audio" ? LIMITS.audio :
    category === "video" ? LIMITS.video :
    LIMITS.other;

  const allowed =
    (category === "audio" && AUDIO_MIME.has(mime)) ||
    (category === "video" && VIDEO_MIME.has(mime)) ||
    (category === "other" && OTHER_MIME.has(mime));

  if (!allowed) {
    // Явно укажем, что именно не нравится
    return errorJson(415, `Формат не поддерживается: ${rawMime || "unknown"}`);
  }

  if (!bytes || bytes < 1) {
    return errorJson(400, "Пустой файл");
  }

  if (bytes > limit) {
    return errorJson(
      413,
      `Файл превышает лимит для ${category}: максимум ${Math.floor(limit / MB)} МБ`
    );
  }

  // Если указан message_id — сверяем владельца
  if (messageId) {
    const { data: msg, error: msgErr } = await supabase
      .from("messages")
      .select("id, user_id")
      .eq("id", messageId)
      .maybeSingle();

    if (msgErr) return errorJson(400, `Ошибка доступа к сообщению: ${msgErr.message}`);
    if (!msg) return errorJson(404, "Сообщение не найдено");
    if (msg.user_id !== user.id) return errorJson(403, "Нет прав на это сообщение");
  }

  // Формируем путь в бакете: userId/yyyy/mm/uuid_filename
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const rand = crypto.randomUUID();
  const filename = sanitizeFilename(file.name || "file");
  const path = `${user.id}/${yyyy}/${mm}/${rand}_${filename}`;

  // Загружаем в Storage с нормализованным contentType
  const arrayBuf = await file.arrayBuffer();
  const { data: uploadRes, error: uploadErr } = await supabase.storage
    .from("attachments")
    .upload(path, arrayBuf, {
      contentType: mime || "application/octet-stream",
      upsert: false,
    });

  if (uploadErr) {
    // Превратим явный конфликт в 409, остальное как 400
    const msg = String(uploadErr.message || "");
    if (msg.toLowerCase().includes("the resource already exists") || msg.includes("409")) {
      return errorJson(409, "Файл с таким путём уже существует");
    }
    return errorJson(400, `Ошибка загрузки в хранилище: ${uploadErr.message}`);
  }

  // Если связан с message_id — создаём запись в message_files и возвращаем её id
  let messageFileId: string | null = null;

  if (messageId) {
    const { data: inserted, error: mfErr } = await supabase
      .from("message_files")
      .insert({
        message_id: messageId,
        path: uploadRes?.path || path,
        mime: mime || null,   // сохраняем нормализованный mime
        bytes: bytes || null,
      })
      .select("id")
      .single();

    if (mfErr) {
      // Файл уже в бакете, но запись в БД не создалась: сообщаем честно
      return errorJson(400, `Файл загружен, но запись БД не создана: ${mfErr.message}`);
    }
    messageFileId = inserted?.id ?? null;
  }

  return json(200, {
    ok: true,
    id: messageFileId,
    path: uploadRes?.path || path,
    mime,       // нормализованный
    bytes,
    category,
  });
}
