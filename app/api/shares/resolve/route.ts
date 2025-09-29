import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { scryptSync } from 'crypto'
import { audit, clientIp } from '@/lib/audit'

function verifyPassword(password: string, stored?: string | null) {
  if (!stored) return true
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const calc = scryptSync(password, salt, 32).toString('base64url')
  return calc === hash
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json().catch(() => ({} as any))
    const t = String(token || '').trim()
    if (!t) return NextResponse.json({ error: 'token required' }, { status: 400 })

    // Берём ссылку и связанную сущность
    const { data: share } = await supabaseAdmin
      .from('shares')
      .select('id, token, owner, message_id, expires_at, password_hash, max_views, views_count')
      .eq('token', t)
      .maybeSingle()

    if (!share) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Проверка срока
    const expired = new Date(share.expires_at).getTime() <= Date.now()
    if (expired) return NextResponse.json({ error: 'Expired' }, { status: 410 })

    // Проверка лимита просмотров
    if (share.max_views != null && share.views_count >= share.max_views) {
      return NextResponse.json({ error: 'View limit exceeded' }, { status: 403 })
    }

    // Пароль
    const needsPassword = !!share.password_hash
    if (needsPassword) {
      if (!password) return NextResponse.json({ error: 'Password required', requires_password: true }, { status: 401 })
      if (!verifyPassword(String(password), share.password_hash)) {
        return NextResponse.json({ error: 'Wrong password', requires_password: true }, { status: 401 })
      }
    }

    // Тянем метаданные сообщения и вложений
    const [{ data: msg }, { data: atts }] = await Promise.all([
      supabaseAdmin.from('messages')
        .select('id, kind, body, created_at, owner')
        .eq('id', share.message_id)
        .maybeSingle(),
      supabaseAdmin.from('attachments')
        .select('id, storage_key, mime_type, size_bytes, message_id')
        .eq('message_id', share.message_id),
    ])

    if (!msg || msg.owner !== share.owner) {
      return NextResponse.json({ error: 'Message not available' }, { status: 404 })
    }

    // Засчитываем просмотр один раз на успешный доступ
    const { data: upd, error: uerr } = await supabaseAdmin
      .from('shares')
      .update({ views_count: (share.views_count ?? 0) + 1 })
      .eq('token', t)
      .select('views_count, max_views')
      .maybeSingle()
    if (uerr) {
      // не валим пользователю, просто продолжаем
    }

    // Аудит
    await audit(req, '00000000-0000-0000-0000-000000000000', 'share.open', { type: 'share', id: t }, {
      ip: clientIp(req),
      message_id: share.message_id
    })

    return NextResponse.json({
      ok: true,
      protected: needsPassword,
      remaining_views:
        upd?.max_views != null ? Math.max(0, (upd.max_views as number) - (upd.views_count as number)) : null,
      expires_at: share.expires_at,
      message: {
        id: msg.id,
        kind: msg.kind,
        body: msg.body,
        created_at: msg.created_at,
      },
      attachments: (atts || []).map(a => ({
        id: a.id,
        storage_key: a.storage_key,
        mime_type: a.mime_type,
        size_bytes: a.size_bytes,
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
