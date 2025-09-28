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

    // 1. Проверяем валидность кода
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

    // 2. Помечаем код как использованный
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otp.id)

    // 3. Создаём или находим пользователя в auth
    const { data: userData, error: userErr } = await supabase.auth.admin.getUserByEmail(email)
    let userId = userData?.user?.id

    if (userErr || !userId) {
      const { data: newUser, error: signUpErr } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      })
      if (signUpErr || !newUser?.user) {
        return NextResponse.json({ error: "Не удалось создать пользователя" }, { status: 500 })
      }
      userId = newUser.user.id
    }

    // 4. Создаём сессию (генерируем токен)
    const { data: tokenData, error: tokenErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    })

    if (tokenErr || !tokenData?.properties?.action_link) {
      return NextResponse.json({ error: "Не удалось создать сессию" }, { status: 500 })
    }

    // 5. Редиректим на messages/new (клиентская часть сама перейдёт)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
