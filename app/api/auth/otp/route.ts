import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

/**
 * Helpers
 */
function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email)
}
function nowIso() {
  return new Date().toISOString()
}
function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000)
}
function htmlTemplate(code: string) {
  return `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
    <h2 style="margin:0 0 12px 0">Ваш код входа</h2>
    <p style="margin:0 0 16px 0">Используйте этот код для входа в ECHO. Он действителен 10 минут.</p>
    <div style="font-size:28px; letter-spacing:6px; font-weight:600">${code}</div>
    <p style="margin:16px 0 0 0; color:#555">Если вы не запрашивали вход, просто игнорируйте это письмо.</p>
  </div>`
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const rawEmail = (body?.email ?? '').toString().trim()
    const email = rawEmail.toLowerCase()
    const isResend = Boolean(body?.resend)

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Введите корректный e-mail' }, { status: 400 })
    }

    // 1) Анти-спам кулдаун: минимум 30 сек между отправками на один email
    const { data: recent, error: qErr } = await supabase
      .from('otp_codes')
      .select('created_at')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (qErr) {
      // не палимся деталями БД наружу
      return NextResponse.json({ error: 'Временная ошибка, попробуйте ещё раз' }, { status: 503 })
    }

    if (recent?.created_at) {
      const last = new Date(recent.created_at)
      const diffSec = Math.floor((Date.now() - last.getTime()) / 1000)
      const COOLDOWN = 30
      if (!isResend && diffSec < COOLDOWN) {
        return NextResponse.json(
          { error: 'Слишком часто. Повторите позже', retry_after: COOLDOWN - diffSec },
          { status: 429 }
        )
      }
    }

    // 2) Чистим просроченные коды лениво
    await supabase.from('otp_codes').delete().lt('expires_at', nowIso())

    // 3) Генерим новый код и сохраняем
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = addMinutes(new Date(), 10).toISOString()

    // Опционально: удаляем старые активные коды для этого email
    await supabase.from('otp_codes').delete().eq('email', email)

    const { error: insErr } = await supabase
      .from('otp_codes')
      .insert({ email, code, expires_at: expiresAt })

    if (insErr) {
      return NextResponse.json({ error: 'Не удалось подготовить код' }, { status: 500 })
    }

    // 4) Письмо через Resend
    const sendRes = await resend.emails.send({
      from: 'ECHO <no-reply@echoproject.space>',
      to: email,
      subject: 'Ваш код входа',
      text: `Ваш одноразовый код: ${code}\nОн действителен 10 минут.`,
      html: htmlTemplate(code),
    } as any)

    if ((sendRes as any)?.error) {
      return NextResponse.json({ error: 'Не удалось отправить письмо' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
