// app/api/shares/list/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const jwt = auth.slice(7)
    const { data: usr } = await supabaseAdmin.auth.getUser(jwt)
    const user = usr?.user
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messageId } = await req.json().catch(() => ({} as any))
    const mid = String(messageId || '').trim()
    if (!mid) return NextResponse.json({ error: 'messageId required' }, { status: 400 })

    const { data: msg } = await supabaseAdmin.from('messages').select('id, owner').eq('id', mid).maybeSingle()
    if (!msg || msg.owner !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: shares } = await supabaseAdmin
      .from('shares')
      .select('id, token, created_at, expires_at, max_views, views_count, password_hash')
      .eq('message_id', mid)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      items: (shares || []).map(s => ({
        id: s.id,
        token: s.token,
        created_at: s.created_at,
        expires_at: s.expires_at,
        max_views: s.max_views ?? null,
        views_count: s.views_count ?? 0,
        protected: !!s.password_hash,
      }))
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
