import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { audit, clientIp } from '@/lib/audit'

export async function POST(req: Request) {
  try {
    const { token, path, expires } = await req.json().catch(() => ({} as any))
    const t = String(token || '').trim()
    const p = String(path || '').trim()
    const exp = Math.max(10, Math.min(Number(expires ?? 60), 600)) // 10..600 сек
    if (!t || !p) return NextResponse.json({ error: 'token and path required' }, { status: 400 })

    const { data: share } = await supabaseAdmin
      .from('shares')
      .select('id, token, owner, message_id, expires_at, max_views, views_count')
      .eq('token', t)
      .maybeSingle()
    if (!share) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (new Date(share.expires_at).getTime() <= Date.now()) return NextResponse.json({ error: 'Expired' }, { status: 410 })
    if (share.max_views != null && share.views_count > share.max_views + 5) {
      return NextResponse.json({ error: 'View limit exceeded' }, { status: 403 })
    }

    const { data: att } = await supabaseAdmin
      .from('attachments')
      .select('id, storage_key, message_id')
      .eq('storage_key', p)
      .maybeSingle()
    if (!att || att.message_id !== share.message_id) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin.storage.from('attachments').createSignedUrl(p, exp)
    if (error || !data?.signedUrl) return NextResponse.json({ error: 'Cannot sign url' }, { status: 500 })

    await audit(req, '00000000-0000-0000-0000-000000000000', 'share.download', { type: 'share', id: t }, {
      ip: clientIp(req),
      storage_key: p,
    })

    return NextResponse.json({ url: data.signedUrl, expires: exp })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
