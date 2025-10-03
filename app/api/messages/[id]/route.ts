// app/api/messages/[id]/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

// Проверка владельца сообщения
async function getOwnedMessage(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  id: string
) {
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
export async function PATCH(req: Request, ctx: any) {
  try {
    const { id } = ctx.params || {};
    if (!id) {
      return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const check = await getOwnedMessage(supabase, String(id));
    if ("error" in check) {
      return NextResponse.json({ ok: false, error: check.error }, { status: check.status });
    }

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

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: true, id: String(id) });
    }

    const { error } = await supabase.from("messages").update(patch).eq("id", String(id));
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: String(id) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "patch failed" }, { status: 500 });
  }
}

// DELETE /api/messages/[id] — удалить сообщение и его файлы
export async function DELETE(_req: Request, ctx: any) {
  try {
    const { id } = ctx.params || {};
    if (!id) {
      return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const check = await getOwnedMessage(supabase, String(id));
    if ("error" in check) {
      return NextResponse.json({ ok: false, error: check.error }, { status: check.status });
    }

    // 1) Список путей в бакете
    const { data: files } = await supabase
      .from("message_files")
      .select("path")
      .eq("message_id", String(id));

    const paths = (files || []).map((f) => f.path);
    if (paths.length > 0) {
      try {
        await supabase.storage.from("attachments").remove(paths);
      } catch {
        // игнорируем неудачное удаление
      }
    }

    // 2) Чистим таблицу файлов
    try {
      await supabase.from("message_files").delete().eq("message_id", String(id));
    } catch {
      // не критично, если не удалось удалить записи
    }

    // 3) Удаляем само сообщение
    const { error } = await supabase.from("messages").delete().eq("id", String(id));
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    // Редирект на список
    return NextResponse.redirect(
      new URL("/messages", process.env.NEXT_PUBLIC_APP_URL || "https://echoproject.space"),
      { status: 302 }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "delete failed" }, { status: 500 });
  }
}

// POST /api/messages/[id] — метод-оверрайд из формы (_method=DELETE)
export async function POST(req: Request, ctx: any) {
  const form = await req.formData().catch(() => null);
  const method = form?.get("_method");
  if (method === "DELETE") {
    return DELETE(req, ctx);
  }
  return NextResponse.json({ ok: false, error: "unsupported" }, { status: 405 });
}
