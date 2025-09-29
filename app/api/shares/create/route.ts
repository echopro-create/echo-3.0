import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { randomBytes, scryptSync } from 'crypto'
import { audit } from '@/lib/audit'

function token(n = 24) { return randomBytes(n).toString('base64url') }
function hashPassword(pw: string) {
  const salt = randomBytes(16).toString('base64url')
  const hash = scryptSync(pw, salt, 32).toString('base64url')
  return `${salt}:${hash}`
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const jwt = auth.slice(7)
    const { data: usr } = await supabaseAdmin.auth.getUser(jwt)
    const user = usr?.user
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({} as any))
    const messageId = String(body?.messageId || '').trim()
    const expiresSeconds = Number(body?.expiresSeconds ?? 86400)
    const password = String(body?.password || '')
    const maxViews = body?.maxViews != null ? Math.max(1, Number(body.maxViews)) : null
    if (!messageId) return NextResponse.json({ error: 'messageId required' }, { status: 400 })

    const { data: msg } = await supabaseAdmin.from('messages').select('id, owner').eq('id', messageId).maybeSingle()
    if (!msg || msg.owner !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const tkn = token(24)
    const expires_at = new Date(Date.now() + Math.max(60, Math.min(expiresSeconds, 30 * 86400)) * 1000).toISOString()
    const password_hash = password ? hashPassword(password) : null

    const { error: ierr } = await supabaseAdmin
      .from('shares')
      .insert({ token: tkn, owner: user.id, message_id: messageId, expires_at, password_hash, max_views: maxViews })
    if (ierr) return NextResponse.json({ error: 'Failed to create share' }, { status: 500 })

    const url = `https://www.echoproject.space/s/${tkn}`

    await audit(req, user.id, 'share.create', { type: 'share', id: tkn }, { message_id: messageId, expires_at, protected: !!password_hash, max_views: maxViews })

    return NextResponse.json({ ok: true, url, token: tkn, expires_at, protected: !!password_hash, max_views: maxViews })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
