// app/api/messages/delete/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { audit } from '@/lib/audit'

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const jwt = auth.slice(7)
    const { data: usr } = await supabaseAdmin.auth.getUser(jwt)
    const user = usr?.user
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json().catch(() => ({} as any))
    const msgId = String(id || '').trim()
    if (!msgId) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { data: msg } = await supabaseAdmin.from('messages').select('id, owner').eq('id', msgId).maybeSingle()
    if (!msg || msg.owner !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // файлы
    const { data: atts } = await supabaseAdmin.from('attachments').select('storage_key').eq('message_id', msgId)
    const keys = (atts || []).map(a => a.storage_key).filter(Boolean) as string[]
    if (keys.length) {
      const { error: remErr } = await supabaseAdmin.storage.from('attachments').remove(keys)
      if (remErr) return NextResponse.json({ error: 'Failed to remove storage objects' }, { status: 500 })
    }

    // чистим shares, attachments, затем message
    const [sharesDel, attsDel, msgDel] = await Promise.all([
      supabaseAdmin.from('shares').delete().eq('message_id', msgId),
      supabaseAdmin.from('attachments').delete().eq('message_id', msgId),
      supabaseAdmin.from('messages').delete().eq('id', msgId),
    ])
    if (sharesDel.error || attsDel.error || msgDel.error) {
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }

    await audit(req, user.id, 'message.delete', { type: 'message', id: msgId })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
