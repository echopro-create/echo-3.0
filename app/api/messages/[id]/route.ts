import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

// Вспомогательное: получить сообщение и проверить владельца
async function getOwnedMessage(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, id: string) {
  const { data: au } = await supabase.auth.getUser();
  if (!au?.user) return { error: "unauthorized", status: 401 as const };

  const { data: msg, error } = await supabase
    .from("messages")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (error || !msg) return { error: "not found", status: 404 as const };
  if (msg.user_id !== au.user.id) return { error: "forbidden", status: 403 as const };

  return { userId: au.user.id, msg };
}

// PATCH /api/messages/[id] — частичное обновление
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabaseServerClient();
    const check = await getOwnedMessage(supabase, params.id);
    if ("error" in check) return NextResponse.json({ ok: false, error: check.error }, { status: check.status });

    const body = await req.json().catch(() => ({} as any));
    const patch: any = {};

    if (typeof body.kind === "string" && ["text", "audio", "video", "files"].includes(body.kind)) {
      patch.kind = body.kind;
    }
    if (body.delivery_mode === "heartbeat" || body.delivery_mode === "date") {
      patch.delivery_mode = body.delivery_mode;
    }
    if (typeof body.content === "string") {
      patch.content = body.content;
    }
    if (body.deliver_at) {
      const dt = new Date(body.deliver_at);
      if (!Number.isNaN(dt.getTime())) patch.deliver_at = dt.toISOString();
    }
    // Нечего менять
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: true, id: params.id });
    }

    const { error } = await supabase.from("messages").update(patch).eq("id", params.id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true, id: params.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "patch failed" }, { status: 500 });
  }
}

// POST /api/messages/[id] c _method=DELETE из формы
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const form = await req.formData().catch(() => null);
  const method = form?.get("_method");
  if (method === "DELETE") return DELETE(req, { params });
  return NextResponse.json({ ok: false, error: "unsupported" }, { status: 405 });
}

// DELETE /api/messages/[id] — удалить сообщение и его файлы
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabaseServerClient();
    const check = await getOwnedMessage(supabase, params.id);
    if ("error" in check) return NextResponse.json({ ok: false, error: check.error }, { status: check.status });

    // Вытащим все файлы и уберём их из Storage
    const { data: files } = await supabase
      .from("message_files")
      .select("path")
      .eq("message_id", params.id);

    const paths = (files || []).map((f) => f.path);
    if (paths.length > 0) {
      await supabase.storage.from("attachments").remove(paths).catch(() => {});
    }

    // Удаляем записи о файлах
    await supabase.from("message_files").delete().eq("message_id", params.id).catch(() => {});

    // Удаляем само сообщение
    const { error } = await supabase.from("messages").delete().eq("id", params.id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    // Редирект на список
    return NextResponse.redirect(new URL("/messages", process.env.NEXT_PUBLIC_APP_URL || "https://echoproject.space"), {
      status: 302,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "delete failed" }, { status: 500 });
  }
}
