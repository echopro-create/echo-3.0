import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };

  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr) {
      return NextResponse.json(
        { ok: false, error: "auth_failed" },
        { status: 401, headers }
      );
    }

    const u = authData?.user;
    const user = u ? { id: u.id, email: u.email } : null;

    return NextResponse.json(
      {
        ok: true,
        user,
        env: {
          url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          anon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
          app: process.env.NEXT_PUBLIC_APP_URL ?? null
        }
      },
      { headers }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500, headers }
    );
  }
}
