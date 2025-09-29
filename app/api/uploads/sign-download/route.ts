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

    const body = await req.json().catch(() => ({} as any))
    const path = String(body?.path || '').trim()
    const expires = Math.max(10, Math.min(Number(body?.expires ?? 60), 600))
    if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 })

    // проверка владельца вложения
    const { data: att } = await supabaseAdmin
      .from('attachments')
      .select('id, owner')
      .eq('storage_key', path)
      .maybeSingle()
    if (!att || att.owner !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data, error } = await supabaseAdmin.storage.from('attachments').createSignedUrl(path, expires)
    if (error || !data?.signedUrl) return NextResponse.json({ error: 'Cannot sign url' }, { status: 500 })

    await audit(req, user.id, 'attachment.sign_download', { type: 'attachment', id: att.id }, { path, expires })

    return NextResponse.json({ url: data.signedUrl })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
