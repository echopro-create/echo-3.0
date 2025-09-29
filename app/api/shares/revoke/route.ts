import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

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
    const token = String(body?.token || '').trim()
    const id = String(body?.id || '').trim()

    if (!token && !id) {
      return NextResponse.json({ error: 'token or id required' }, { status: 400 })
    }

    const q = supabaseAdmin.from('shares').delete()
    if (token) q.eq('token', token)
    if (id) q.eq('id', id)
    q.eq('owner', user.id)

    const { error } = await q
    if (error) return NextResponse.json({ error: 'Failed to revoke' }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
