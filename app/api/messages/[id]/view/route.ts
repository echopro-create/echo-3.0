import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export async function GET(_req: Request, ctx: any) {
  const { id } = ctx.params || {};
  if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: au } = await supabase.auth.getUser();
  if (!au?.user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("messages")
    .select("id, user_id, kind, content, delivery_mode, deliver_at, created_at")
    .eq("id", String(id))
    .single();

  if (error || !data) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  if (data.user_id !== au.user.id) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  return NextResponse.json({
    id: data.id,
    kind: data.kind,
    content: data.content,
    delivery_mode: data.delivery_mode,
    deliver_at: data.deliver_at,
    created_at: data.created_at
  });
}
