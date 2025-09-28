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

    // 1) Ищем активный код
    const { data: otp, error: otpErr } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (otpErr || !otp) {
      return NextResponse.json({ error: "Неверный или просроченный код" }, { status: 401 })
    }

    // 2) Помечаем код использованным
    await supabase.from("otp_codes").update({ used: true }).eq("id", otp.id)

    // 3) Мягко создаём пользователя, если его ещё нет (ошибку «уже существует» игнорируем)
    await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    }).catch(() => {})

    // Примечание: полноценную сессию добавим следующим шагом
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
