import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const e = String(email || "").trim().toLowerCase();

    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(e)) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }

    const supabase = createClient(url, anon);
    const { error } = await supabase.auth.signInWithOtp({
      email: e,
      options: {
        // редирект на /login не обязателен при кодовом режиме, но пусть будет
        emailRedirectTo: (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000") + "/login",
      },
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "OTP send failed" }, { status: 500 });
  }
}
