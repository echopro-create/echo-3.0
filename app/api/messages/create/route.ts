// app/api/messages/create/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type AttachmentInput = {
  path: string
  mime_type?: string
  size_bytes?: number
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const jwt = auth.slice(7)
    const { data: usr, error: uerr } = await supabaseAdmin.auth.getUser(jwt)
    if (uerr || !usr?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = usr.user

    const body = await req.json().catch(() => ({} as any))
    const kind = (body?.kind || 'file') as 'text'|'voice'|'video'|'file'
    const text = (body?.body || '') as string
    const attachments = (body?.attachments || []) as AttachmentInput[]

    // Вставляем сообщение
    const { data: msg, error: merr } = await supabaseAdmin
      .from('messages')
      .insert([{ owner: user.id, kind, body: text || null }])
      .select('id')
      .single()

    if (merr || !msg?.id) {
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
    }

    // Вставляем вложения, если есть
    if (attachments.length) {
      const rows = attachments.map(a => ({
        owner: user.id,
        message_id: msg.id,
        storage_key: a.path,
        mime_type: a.mime_type || null,
        size_bytes: a.size_bytes ?? null
      }))
      const { error: aerr } = await supabaseAdmin.from('attachments').insert(rows)
      if (aerr) {
        return NextResponse.json({ error: 'Message created, but attachments failed' }, { status: 207 })
      }
    }

    return NextResponse.json({ ok: true, id: msg.id })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
