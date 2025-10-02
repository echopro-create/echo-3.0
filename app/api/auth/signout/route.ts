import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

// Делаем роут динамическим, чтобы не прилипал к кэшу.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  // Чистим локальную сессию (куки)
  await supabase.auth.signOut({ scope: "local" });
  const { origin } = new URL(req.url);
  return NextResponse.redirect(`${origin}/login`, { status: 302 });
}

// На всякий случай позволим и GET (если кто-то ткнёт ссылкой)
export async function GET(req: Request) {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });
  const { origin } = new URL(req.url);
  return NextResponse.redirect(`${origin}/login`, { status: 302 });
}
