import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()
    if (!email || !code) {
      return NextResponse.json({ error: "Email и код обязательны" }, { status: 400 })
    }

    // 1) Проверяем OTP
    const { data: otp } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!otp) {
      return NextResponse.json({ error: "Неверный или просроченный код" }, { status: 401 })
    }

    // 2) Пометить код использованным
    await supabase.from("otp_codes").update({ used: true }).eq("id", otp.id)

    // 3) Мягко создать пользователя, если ещё нет
    await supabase.auth.admin.createUser({ email, email_confirm: true }).catch(() => {})

    // 4) Сгенерировать magic-link и направить на нашу приёмную страницу
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    })
    if (linkErr || !linkData?.properties?.action_link) {
      return NextResponse.json({ error: "Не удалось создать сессию" }, { status: 500 })
    }

    // КЛЮЧЕВАЯ СТРОКА: редиректим на /auth/confirm
    const redirectTo = "https://echoproject.space/auth/confirm"
    const url = `${linkData.properties.action_link}&redirect_to=${encodeURIComponent(redirectTo)}`
    return NextResponse.json({ ok: true, redirect: url })
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
