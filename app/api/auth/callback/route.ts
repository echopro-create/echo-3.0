# Перезаписываем файл (UTF-8 без BOM) — ВНУТРИ только TypeScript!
$Path = "D:\echo-git\app\api\auth\callback\route.ts"
$Utf8 = New-Object System.Text.UTF8Encoding($false)
$Content = @'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email)
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const rawEmail = (body?.email ?? '').toString().trim().toLowerCase()
    const code = (body?.code ?? '').toString().trim()
    const nextUrl = (body?.next ?? '/messages/new').toString()

    if (!isValidEmail(rawEmail)) {
      return NextResponse.json({ error: 'Некорректный e-mail' }, { status: 400 })
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Код должен состоять из 6 цифр' }, { status: 400 })
    }

    // 1) Ищем свежий неиспользованный код
    const { data: otpRow, error: selErr } = await supabase
      .from('otp_codes')
      .select('id, email, code, expires_at, used')
      .eq('email', rawEmail)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (selErr) {
      return NextResponse.json({ error: 'Временная ошибка, попробуйте позже' }, { status: 503 })
    }
    if (!otpRow) {
      return NextResponse.json({ error: 'Неверный или просроченный код' }, { status: 401 })
    }

    // 2) Одноразовость: помечаем использованным и чистим прочие коды этого email
    await supabase.from('otp_codes').update({ used: true }).eq('id', otpRow.id)
    await supabase.from('otp_codes').delete().neq('id', otpRow.id).eq('email', rawEmail)

    // 3) Создаём пользователя, если ещё нет (молча игнорируем конфликт)
    try {
      await supabase.auth.admin.createUser({ email: rawEmail, email_confirm: true })
    } catch {}

    // 4) Формируем безопасный redirectTo
    const origin =
      req.headers.get('origin') ||
      (() => {
        try {
          const u = new URL(req.headers.get('referer') || '')
          return `${u.protocol}//${u.host}`
        } catch {
          return 'https://echoproject.space'
        }
      })()

    const safeNext = nextUrl.startsWith('/') ? nextUrl : '/messages/new'
    const redirectTo = `${origin}${safeNext}`

    // 5) Генерируем magic-link
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: rawEmail,
      options: { redirectTo }
    })

    const actionLink =
      (linkData as any)?.action_link ||
      (linkData as any)?.properties?.action_link ||
      null

    if (linkErr || !actionLink) {
      return NextResponse.json({ error: 'Не удалось создать сессию' }, { status: 502 })
    }

    // 6) Возвращаем URL для перехода
    return NextResponse.json({ ok: true, redirect: actionLink })
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
'@
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($Path)) | Out-Null
[IO.File]::WriteAllText($Path, $Content, $Utf8)
Write-Host "Что сделали: очистили файл и записали валидный TypeScript."
