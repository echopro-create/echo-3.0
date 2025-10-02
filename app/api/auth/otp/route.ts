import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { email } = await req.json()
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
