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

    await audit(req, user.id, 'account.delete.request')

    const { data: atts } = await supabaseAdmin.from('attachments').select('storage_key').eq('owner', user.id)
    const keys = (atts || []).map(a => a.storage_key).filter(Boolean) as string[]
    if (keys.length) {
      const { error: remErr } = await supabaseAdmin.storage.from('attachments').remove(keys)
      if (remErr) return NextResponse.json({ error: 'Failed to remove storage objects' }, { status: 500 })
    }

    const [sharesDel, messagesDel, attsDel] = await Promise.all([
      supabaseAdmin.from('shares').delete().eq('owner', user.id),
      supabaseAdmin.from('messages').delete().eq('owner', user.id),
      supabaseAdmin.from('attachments').delete().eq('owner', user.id),
    ])
    if (sharesDel.error || messagesDel.error || attsDel.error) {
      return NextResponse.json({ error: 'Failed to wipe tables' }, { status: 500 })
    }

    const del = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (del.error) return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })

    await audit(req, user.id, 'account.delete.done')

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
