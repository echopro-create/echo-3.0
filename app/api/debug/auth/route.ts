import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  const access = req.cookies.get("sb-access-token")?.value || null;
  const hasRefresh = !!req.cookies.get("sb-refresh-token")?.value;

  const supabase = createClient(url, anon, {
    global: { headers: access ? { Authorization: `Bearer ${access}` } : {} },
  });

  const { data: u, error } = await supabase.auth.getUser();

  return NextResponse.json({
    hasAccessCookie: !!access,
    hasRefreshCookie: hasRefresh,
    userId: u?.user?.id || null,
    authError: error?.message || null,
  });
}
