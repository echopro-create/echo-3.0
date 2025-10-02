import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" }); // чистим cookie-сессию
  const url = new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "https://echoproject.space");
  return NextResponse.redirect(url);
}
