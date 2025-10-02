import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";

const MessageSchema = z.object({
  kind: z.enum(['text','audio','video','files']),
  content: z.string().max(10000).optional().nullable(),
  delivery_mode: z.enum(['heartbeat','date']),
  deliver_at: z.string().datetime().optional().nullable()
});

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  const { data, error } = await supabase
    .from('messages')
    .select('id, kind, content, delivery_mode, deliver_at, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();

  if (userErr || !userData.user) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  let body: z.infer<typeof MessageSchema>;
  try {
    const json = await req.json();
    body = MessageSchema.parse(json);
  } catch (e: any) {
    const msg = e?.message || "Некорректные данные";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const insert = {
    user_id: userData.user.id,
    kind: body.kind,
    content: body.content ?? null,
    delivery_mode: body.delivery_mode,
    deliver_at: body.delivery_mode === 'date' ? (body.deliver_at ?? null) : null
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(insert)
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data?.id });
}
