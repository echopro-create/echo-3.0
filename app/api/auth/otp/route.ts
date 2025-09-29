import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

const MIN_INTERVAL_SEC = 60            // минимум между отправками для одного email
const MAX_PER_HOUR_EMAIL = 5           // максимум писем на email за час
const MAX_PER_HOUR_IP = 20             // максимум писем с одного IP за час
const CODE_TTL_MIN = 10                // срок жизни кода в минутах

function isValidEmail(v: string) {
  return /\S+@\S+\.\S+/.test(v)
}
function getClientIp(req: Request) {
  const xf = req.headers.get('x-forwarded-for') || ''
  if (xf) return xf.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    const rawEmail = String(email || '').trim().toLowerCase()
    if (!isValidEmail(rawEmail)) {
      return NextResponse.json({ error: 'Введите корректный e-mail' }, { status: 400 })
    }

    const ip = getClientIp(req)
    const nowIso = new Date().toISOString()

    // 1) Лимит по интервалу: последний код для этого email
    const { data: lastForEmail } = await supabase
      .from('otp_codes')
      .select('created_at')
      .eq('email', rawEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastForEmail?.created_at) {
      const last = new Date(lastForEmail.created_at).getTime()
      const diffSec = Math.floor((Date.now() - last) / 1000)
      if (diffSec < MIN_INTERVAL_SEC) {
        return NextResponse.json(
          { error: `Слишком часто. Повторите через ${MIN_INTERVAL_SEC - diffSec} сек.` },
          { status: 429 }
        )
      }
    }

    // 2) Лимиты за час: по email и по IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const [emailCountRes, ipCountRes] = await Promise.all([
      supabase
        .from('otp_codes')
        .select('id', { count: 'exact', head: true })
        .eq('email', rawEmail)
        .gt('created_at', oneHourAgo),
      supabase
        .from('otp_codes')
        .select('id', { count: 'exact', head: true })
        .eq('request_ip', ip)
        .gt('created_at', oneHourAgo),
    ])

    const emailCount = emailCountRes.count ?? 0
    const ipCount = ipCountRes.count ?? 0

    if (emailCount >= MAX_PER_HOUR_EMAIL) {
      return NextResponse.json(
        { error: 'Лимит писем на этот адрес исчерпан. Попробуйте позже.' },
        { status: 429 }
      )
    }
    if (ip !== 'unknown' && ipCount >= MAX_PER_HOUR_IP) {
      return NextResponse.json(
        { error: 'Слишком много попыток с этого устройства. Подождите немного.' },
        { status: 429 }
      )
    }

    // 3) Генерация нового кода. Подчищаем старые неиспользованные коды для этого email.
    await supabase.from('otp_codes').delete().eq('email', rawEmail).eq('used', false)

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + CODE_TTL_MIN * 60 * 1000).toISOString()

    const { error: dbError } = await supabase
      .from('otp_codes')
      .insert({ email: rawEmail, code, expires_at: expiresAt, used: false, request_ip: ip, created_at: nowIso })

    if (dbError) {
      return NextResponse.json(
        { error: 'Ошибка сохранения кода', detail: dbError.message || dbError.details || dbError.hint },
        { status: 500 }
      )
    }

    // 4) Отправка письма
    const sendRes = await resend.emails.send({
      from: 'Echo <no-reply@echoproject.space>',
      to: rawEmail,
      subject: 'Ваш код входа',
      text: `Ваш одноразовый код: ${code}\nДействителен ${CODE_TTL_MIN} минут.\nЕсли это были не вы, игнорируйте письмо.`
    } as any)

    if ((sendRes as any)?.error) {
      return NextResponse.json(
        { error: 'Не удалось отправить письмо', detail: (sendRes as any).error?.message || (sendRes as any).error },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true, ttl_minutes: CODE_TTL_MIN })
  } catch (e: any) {
    return NextResponse.json({ error: 'Ошибка сервера', detail: e?.message }, { status: 500 })
  }
}
