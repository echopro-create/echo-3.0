import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { randomBytes } from 'crypto'

function token(n = 24) {
  return randomBytes(n).toString('base64url')
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const jwt = auth.slice(7)
    const { data: usr } = await supabaseAdmin.auth.getUser(jwt)
    const user = usr?.user
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({} as any))
    const messageId = String(body?.messageId || '').trim()
    const expiresSeconds = Number(body?.expiresSeconds ?? 86400) // по умолчанию сутки

    if (!messageId) {
      return NextResponse.json({ error: 'messageId required' }, { status: 400 })
    }

    // Владелец ли пользователь указанного сообщения
    const { data: msg, error: merr } = await supabaseAdmin
      .from('messages')
      .select('id, owner')
      .eq('id', messageId)
      .maybeSingle()

    if (merr || !msg || msg.owner !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const tkn = token(24)
    const expires_at = new Date(Date.now() + Math.max(60, Math.min(expiresSeconds, 30 * 86400)) * 1000).toISOString()

    const { error: ierr } = await supabaseAdmin
      .from('shares')
      .insert({ token: tkn, owner: user.id, message_id: messageId, expires_at })

    if (ierr) {
      return NextResponse.json({ error: 'Failed to create share' }, { status: 500 })
    }

    const url = `https://www.echoproject.space/s/${tkn}`
    return NextResponse.json({ ok: true, url, token: tkn, expires_at })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
