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

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: dbError } = await supabase
      .from("otp_codes")
      .insert({ email: email.toLowerCase(), code, expires_at: expiresAt })

    if (dbError) {
      return NextResponse.json(
        { error: "Ошибка сохранения кода", detail: dbError.message || dbError.details || dbError.hint },
        { status: 500 }
      )
    }

    // ВРЕМЕННО: тестовый домен Resend, чтобы логи точно появились
    const sendRes = await resend.emails.send({
      from: "Echo <onboarding@resend.dev>",
      to: email,
      subject: "Ваш код входа",
      text: `Ваш одноразовый код для входа: ${code}\nОн действителен 10 минут.`,
    } as any)

    if ((sendRes as any)?.error) {
      return NextResponse.json(
        { error: "Ошибка отправки кода", detail: (sendRes as any).error?.message || (sendRes as any).error },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Ошибка сервера", detail: err?.message },
      { status: 500 }
    )
  }
}
