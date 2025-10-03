import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";

// Принимаем multipart/form-data: fields: message_id (опц.), file
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  // Авторизация
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ ok: false, error: "Пустой запрос" }, { status: 400 });
  }

  const file = formData.get("file");
  const messageId = (formData.get("message_id") as string) || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Нет файла" }, { status: 400 });
  }

  // Имя пути в бакете: userId/yyyy/mm/uuid_filename
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const rand = crypto.randomUUID();
  const cleanName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${userData.user.id}/${yyyy}/${mm}/${rand}_${cleanName}`;

  // Загружаем в Storage
  const { data: uploadRes, error: uploadErr } = await supabase.storage
    .from("attachments")
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadErr) {
    return NextResponse.json({ ok: false, error: uploadErr.message }, { status: 400 });
  }

  // Если указан message_id — создаём запись в message_files
  if (messageId) {
    const { error: mfErr } = await supabase
      .from("message_files")
      .insert({
        message_id: messageId,
        path: uploadRes?.path || path,
        mime: file.type || null,
        bytes: file.size || null
      });

    if (mfErr) {
      return NextResponse.json({ ok: false, error: mfErr.message }, { status: 400 });
    }
  }

  return NextResponse.json({
    ok: true,
    path: uploadRes?.path || path,
    mime: file.type || null,
    bytes: file.size || null
  });
}
