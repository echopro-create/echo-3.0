import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    // Авторизация по Bearer токену из supabase-js
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const jwt = auth.slice(7)
    const { data: usr } = await supabaseAdmin.auth.getUser(jwt)
    const user = usr?.user
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({} as any))
    const path = String(body?.path || '').trim()
    const expires = Math.max(10, Math.min(Number(body?.expires ?? 60), 3600)) // 10..3600 сек

    // Путь должен начинаться с user.id/
    if (!path || !path.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Выдаём подписанную ссылку на скачивание
    const { data, error } = await supabaseAdmin
      .storage
      .from('attachments')
      .createSignedUrl(path, expires)

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: 'Failed to sign URL' }, { status: 500 })
    }

    return NextResponse.json({ url: data.signedUrl, expires })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
