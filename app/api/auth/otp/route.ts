import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function roughEmailOk(e: string): boolean {
  const s = e.trim();
  const at = s.indexOf("@");
  if (at <= 0) return false;
  const domain = s.slice(at + 1);
  return domain.includes("."); // минимальная адекватность, детали — на совести провайдера
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const e = String(email || "").trim();

    if (!roughEmailOk(e)) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }

    const supabase = createClient(url, anon);
    const { error } = await supabase.auth.signInWithOtp({
      email: e,
      options: {
        // редирект не обязателен для кода, но пусть будет валидный URL проекта
        emailRedirectTo:
          (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000") + "/login",
      },
    });

    if (error) {
      // пробрасываем текст супабейза, но без внутренностей
      return NextResponse.json({ error: error.message || "Не удалось отправить код" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "OTP send failed" },
      { status: 500 }
    );
  }
}
