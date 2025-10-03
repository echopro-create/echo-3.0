import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const uid = data?.user?.id || null;

  const raw = process.env.ADMIN_USER_IDS || "";
  const list = raw.split(",").map(s => s.trim()).filter(Boolean);
  const inWhitelist = !!(uid && list.includes(uid));

  return NextResponse.json({
    ok: true,
    uid,
    whitelist: list,
    inWhitelist,
    hint: inWhitelist
      ? "UID есть в ADMIN_USER_IDS. Если /admin/usage всё ещё 404 — значит ты не авторизован на этом домене."
      : "UID отсутствует в ADMIN_USER_IDS или ты не авторизован.",
    domain: {
      host: process.env.NEXT_PUBLIC_APP_URL || null,
      note: "Проверь, что логинишься на том же домене (apex vs www)."
    }
  }, { headers: { "Cache-Control": "no-store" } });
}
