import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

// Сервер должен обновить куки на основе токенов, полученных после verifyOtp на клиенте
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { access_token, refresh_token } = await req.json().catch(() => ({} as any));

  if (!access_token || !refresh_token) {
    return NextResponse.json({ ok: false, error: "missing tokens" }, { status: 400 });
  }

  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
