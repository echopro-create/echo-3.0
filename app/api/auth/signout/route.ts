import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });

  const { origin } = new URL(req.url);
  return NextResponse.redirect(`${origin}/login`, { status: 302 });
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });

  const { origin } = new URL(req.url);
  return NextResponse.redirect(`${origin}/login`, { status: 302 });
}
