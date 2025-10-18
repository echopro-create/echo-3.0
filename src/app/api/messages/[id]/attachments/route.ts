import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Body = {
  files: { path: string; mime?: string | null; bytes: number }[];
};

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: messageId } = await ctx.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json()) as Body;
  if (!Array.isArray(body.files) || body.files.length === 0) {
    return NextResponse.json({ error: "no_files" }, { status: 400 });
    }

  // Проверяем владение сообщением
  const { data: m, error: mErr } = await supabase
    .from("messages")
    .select("id,user_id")
    .eq("id", messageId)
    .single();

  if (mErr || !m || m.user_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rows = body.files.map((f) => ({
    message_id: messageId,
    user_id: user.id,
    bucket: "attachments",
    path: f.path,
    mime: f.mime ?? null,
    bytes: f.bytes,
  }));

  const { error: insErr } = await supabase.from("attachments").insert(rows);
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
