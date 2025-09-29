import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: Request) {
  try {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const jwt = auth.slice(7)
    const { data: usr } = await supabaseAdmin.auth.getUser(jwt)
    const user = usr?.user
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [messagesRes, attachmentsRes, sharesRes] = await Promise.all([
      supabaseAdmin.from('messages')
        .select('*')
        .eq('owner', user.id)
        .order('created_at', { ascending: false }),
      supabaseAdmin.from('attachments')
        .select('*')
        .eq('owner', user.id)
        .order('created_at', { ascending: false }),
      supabaseAdmin.from('shares')
        .select('*')
        .eq('owner', user.id)
        .order('created_at', { ascending: false }),
    ])

    const payload = {
      user: { id: user.id, email: (user as any).email ?? null },
      messages: messagesRes.data ?? [],
      attachments: attachmentsRes.data ?? [],
      shares: sharesRes.data ?? [],
      generated_at: new Date().toISOString(),
    }

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Disposition': `attachment; filename="echo-export-${Date.now()}.json"`,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
