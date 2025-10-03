// app/api/shares/by-message/[id]/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function bad(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });
}
function ok(payload: any) {
  return NextResponse.json({ ok: true, ...payload }, { headers: { "Cache-Control": "no-store" } });
}
function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server misconfig: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(_req: Request, ctx: any) {
  const supa = await createSupabaseServerClient();
  const { data: au } = await supa.auth.getUser();
  const user = au?.user;
  if (!user) return bad(401, "Не авторизован");

  const id = String(ctx?.params?.id || "");
  if (!id) return bad(400, "message id required");

  const adm = admin();

  // проверяем, что сообщение принадлежит пользователю
  const { data: msg, error: msgErr } = await adm
    .from("messages")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (msgErr) return bad(400, msgErr.message);
  if (!msg || msg.user_id !== user.id) return bad(403, "Нет доступа");

  // берём несколько последних ссылок и ищем активную
  const { data: shares, error: shErr } = await adm
    .from("shares")
    .select("token, expires_at, views, max_views, revoked, password_hash, created_at, last_view_at")
    .eq("message_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (shErr) return bad(400, shErr.message);

  const active = (shares || []).find((s) => !s.revoked) || null;

  const appBase = process.env.NEXT_PUBLIC_APP_URL || "";
  const url = active ? (appBase ? `${appBase}/s/${active.token}` : `/s/${active.token}`) : null;

  return ok({
    share: active
      ? {
          token: active.token,
          url,
          expires_at: active.expires_at,
          views: active.views ?? 0,
          max_views: active.max_views ?? null,
          password_enabled: !!active.password_hash,
          last_view_at: active.last_view_at ?? null,
        }
      : null,
  });
}
