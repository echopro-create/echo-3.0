import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const token = String(url.searchParams.get('token') || '').trim()
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

    // Нашли шаринг-запись
    const { data: share, error: serr } = await supabaseAdmin
      .from('shares')
      .select('id, owner, message_id, expires_at')
      .eq('token', token)
      .maybeSingle()

    if (serr || !share) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (share.expires_at && new Date(share.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Expired' }, { status: 410 })
    }

    // Забираем сообщение + вложения
    const { data: msg, error: merr } = await supabaseAdmin
      .from('messages')
      .select('id, kind, body, created_at, owner, attachments ( id, storage_key, mime_type, size_bytes )')
      .eq('id', share.message_id)
      .maybeSingle()

    if (merr || !msg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Генерим краткоживущие ссылки для предпросмотра/скачивания
    const files = msg.attachments || []
    const signed: Array<{ id: string; name: string; mime_type: string | null; size_bytes: number | null; url: string }> = []

    for (const a of files) {
      const { data, error } = await supabaseAdmin
        .storage
        .from('attachments')
        .createSignedUrl(a.storage_key, 60) // 60 секунд на скачивание

      if (!error && data?.signedUrl) {
        const name = a.storage_key.split('/').slice(1).join('/') || 'download'
        signed.push({ id: a.id, name, mime_type: a.mime_type ?? null, size_bytes: a.size_bytes ?? null, url: data.signedUrl })
      }
    }

    // Нарастим счётчик просмотров для приличия
    await supabaseAdmin.from('shares').update({ views: (null as any) }).eq('id', share.id)

    return NextResponse.json({
      ok: true,
      message: {
        id: msg.id,
        kind: msg.kind,
        body: msg.body,
        created_at: msg.created_at,
      },
      files: signed
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
