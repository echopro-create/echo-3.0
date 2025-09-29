import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { scryptSync } from 'crypto'

function verifyPassword(password: string, password_hash: string) {
  const [salt, saved] = password_hash.split(':')
  if (!salt || !saved) return false
  const hash = scryptSync(password, salt, 32).toString('base64url')
  return hash === saved
}

async function buildResponse(share: any) {
  // Сообщение + вложения
  const { data: msg, error: merr } = await supabaseAdmin
    .from('messages')
    .select('id, kind, body, created_at, owner, attachments ( id, storage_key, mime_type, size_bytes )')
    .eq('id', share.message_id)
    .maybeSingle()

  if (merr || !msg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const files = msg.attachments || []
  const signed: Array<{ id: string; name: string; mime_type: string | null; size_bytes: number | null; url: string }> = []

  for (const a of files) {
    const { data, error } = await supabaseAdmin
      .storage
      .from('attachments')
      .createSignedUrl(a.storage_key, 60)
    if (!error && data?.signedUrl) {
      const name = a.storage_key.split('/').slice(1).join('/') || 'download'
      signed.push({ id: a.id, name, mime_type: a.mime_type ?? null, size_bytes: a.size_bytes ?? null, url: data.signedUrl })
    }
  }

  // Инкрементируем просмотры, если есть лимит
  if (share.max_views != null) {
    const nextViews = (share.views ?? 0) + 1
    await supabaseAdmin.from('shares').update({ views: nextViews }).eq('id', share.id)
  } else {
    // Просто отметим посещение; гонки нас не волнуют
    await supabaseAdmin.from('shares').update({ views: (share.views ?? 0) + 1 }).eq('id', share.id)
  }

  return NextResponse.json({
    ok: true,
    message: {
      id: msg.id,
      kind: msg.kind,
      body: msg.body,
      created_at: msg.created_at,
    },
    files: signed
  })
}

async function loadShareByToken(token: string) {
  const { data: share, error: serr } = await supabaseAdmin
    .from('shares')
    .select('id, owner, message_id, expires_at, password_hash, max_views, views')
    .eq('token', token)
    .maybeSingle()
  if (serr || !share) return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) }
  if (share.expires_at && new Date(share.expires_at).getTime() < Date.now()) {
    return { error: NextResponse.json({ error: 'Expired' }, { status: 410 }) }
  }
  if (share.max_views != null && (share.views ?? 0) >= share.max_views) {
    return { error: NextResponse.json({ error: 'Limit exceeded' }, { status: 410 }) }
  }
  return { share }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = String(url.searchParams.get('token') || '').trim() || url.pathname.split('/').pop() || ''
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const { share, error } = await loadShareByToken(token)
  if (error) return error

  if (share.password_hash) {
    // Нужен пароль
    return NextResponse.json({ error: 'password_required' }, { status: 401 })
  }
  return buildResponse(share)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any))
  const token = String(body?.token || '').trim()
  const password = String(body?.password || '')
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const { share, error } = await loadShareByToken(token)
  if (error) return error

  if (share.password_hash) {
    if (!password || !verifyPassword(password, share.password_hash)) {
      return NextResponse.json({ error: 'password_invalid' }, { status: 401 })
    }
  }
  return buildResponse(share)
}
