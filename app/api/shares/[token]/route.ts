// app/api/shares/[token]/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function bad(status: number, error: string) {
  return NextResponse.json(
    { ok: false, error },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function ok(payload: Record<string, unknown>) {
  return NextResponse.json(
    { ok: true, ...payload },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/**
 * DELETE /api/shares/[token]
 * Мягкий отзыв шаринга: revoked=true.
 * Идемпотентно: повторные вызовы возвращают 200.
 * Доступ: только владелец сообщения (RLS "owner_manage_shares").
 */
export async function DELETE(
  _req: Request,
  context: { params: { token: string } }
) {
  const supabase = await createSupabaseServerClient();

  const { data: au } = await supabase.auth.getUser();
  const user = au?.user;
  if (!user) return bad(401, "Не авторизован");

  const token = context.params.token?.trim();
  if (!token) return bad(400, "token обязателен в пути");

  const { data: updated, error: updErr } = await supabase
    .from("shares")
    .update({ revoked: true })
    .eq("token", token)
    .select("token, revoked, expires_at, views, max_views")
    .maybeSingle();

  if (updErr) return bad(400, updErr.message);
  if (!updated) return bad(404, "Ссылка не найдена или нет прав");

  return ok({
    token: updated.token,
    revoked: true,
    expires_at: updated.expires_at,
    views: updated.views,
    max_views: updated.max_views ?? null,
    status: "revoked",
  });
}
