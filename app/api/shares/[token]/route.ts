// app/api/shares/[token]/password/route.ts
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

// SHA-256( password || salt )
async function deriveHash(password: string, saltBytes: Uint8Array) {
  const enc = new TextEncoder();
  const passBytes = enc.encode(password);
  const toHash = new Uint8Array(passBytes.length + saltBytes.length);
  toHash.set(passBytes, 0);
  toHash.set(saltBytes, passBytes.length);
  const digest = await crypto.subtle.digest("SHA-256", toHash);
  const hashHex = Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  const saltHex = Array.from(saltBytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return { hashHex, saltHex };
}

/**
 * POST /api/shares/[token]/password
 * Установить/снять пароль шаринга.
 * body: { password?: string | null } — пустая строка/null снимает пароль.
 */
export async function POST(
  req: Request,
  ctx: RouteContext<"/api/shares/[token]/password">
) {
  const { token } = await ctx.params; // Next 15: params как Promise
  if (!token?.trim()) return bad(400, "token обязателен в пути");

  const supabase = await createSupabaseServerClient();

  const { data: au } = await supabase.auth.getUser();
  const user = au?.user;
  if (!user) return bad(401, "Не авторизован");

  const body = await req.json().catch(() => ({} as any));
  const raw = body?.password;
  const hasPassword = typeof raw === "string" ? raw.trim().length > 0 : false;

  // Снятие пароля
  if (!hasPassword) {
    const { data: cleared, error: clrErr } = await supabase
      .from("shares")
      .update({ password_hash: null, password_salt: null })
      .eq("token", token.trim())
      .select("token")
      .maybeSingle();

    if (clrErr) return bad(400, clrErr.message);
    if (!cleared) return bad(404, "Ссылка не найдена или нет прав");

    return ok({
      token: cleared.token,
      password_protected: false,
      status: "password_removed",
    });
  }

  // Установка пароля
  const password = String(raw);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const { hashHex, saltHex } = await deriveHash(password, salt);

  const { data: updated, error: updErr } = await supabase
    .from("shares")
    .update({ password_hash: hashHex, password_salt: saltHex })
    .eq("token", token.trim())
    .select("token")
    .maybeSingle();

  if (updErr) return bad(400, updErr.message);
  if (!updated) return bad(404, "Ссылка не найдена или нет прав");

  return ok({
    token: updated.token,
    password_protected: true,
    status: "password_set",
  });
}
