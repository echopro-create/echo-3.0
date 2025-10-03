import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function bad(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });
}

function ok(payload: Record<string, unknown>) {
  return NextResponse.json({ ok: true, ...payload }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: au } = await supabase.auth.getUser();
  const user = au?.user;
  if (!user) return bad(401, "Не авторизован");

  const body = await req.json().catch(() => ({}));
  const message_id = String(body?.message_id || "");
  const ttl_days = Math.max(1, Math.min(30, Number(body?.ttl_days ?? 7))); // 1..30

  if (!message_id) return bad(400, "message_id обязателен");

  // Проверяем, что сообщение принадлежит пользователю
  const { data: msg, error: msgErr } = await supabase
    .from("messages")
    .select("id, user_id")
    .eq("id", message_id)
    .maybeSingle();

  if (msgErr) return bad(400, msgErr.message);
  if (!msg || msg.user_id !== user.id) return bad(403, "Нет доступа к сообщению");

  // Генерим токен: 32 hex-символа
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, -4);

  const expires_at = new Date(Date.now() + ttl_days * 24 * 60 * 60 * 1000).toISOString();

  // Вставка в shares пройдет под RLS, т.к. политики разрешают владельцу (мы это проверили выше)
  const { data: share, error: insErr } = await supabase
    .from("shares")
    .insert({ token, message_id, expires_at })
    .select("token, expires_at")
    .single();

  if (insErr) return bad(400, insErr.message);

  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const url = base ? `${base}/s/${share.token}` : `/s/${share.token}`;

  return ok({ token: share.token, url, expires_at: share.expires_at });
}
