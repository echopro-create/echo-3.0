import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 })
    }

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Сохраняем его в БД с временем жизни 10 мин
    const { error: dbError } = await supabase
      .from("otp_codes")
      .insert({
        email: email.toLowerCase(),
        code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      })

    if (dbError) {
      console.error(dbError)
      return NextResponse.json({ error: "Ошибка сохранения кода" }, { status: 500 })
    }

    // Отправляем письмо
    await resend.emails.send({
      from: "Echo <no-reply@echoproject.space>",
      to: email,
      subject: "Ваш код входа",
      text: `Ваш одноразовый код для входа: ${code}\nОн действителен 10 минут.`,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Ошибка отправки кода" }, { status: 500 })
  }
}
