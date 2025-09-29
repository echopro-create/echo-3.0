import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    // Авторизация: токен из supabase-js
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const jwt = auth.slice(7)
    const { data: usr } = await supabaseAdmin.auth.getUser(jwt)
    const user = usr?.user
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json().catch(() => ({} as any))
    const messageId = String(id || '').trim()
    if (!messageId) return NextResponse.json({ error: 'Message id required' }, { status: 400 })

    // 1) Собираем ключи вложений текущего пользователя
    const { data: atts, error: aerr } = await supabaseAdmin
      .from('attachments')
      .select('storage_key')
      .eq('owner', user.id)
      .eq('message_id', messageId)

    if (aerr) return NextResponse.json({ error: 'Failed to list attachments' }, { status: 500 })

    const keys = (atts || []).map(a => a.storage_key).filter(Boolean) as string[]

    // 2) Удаляем объекты из приватного бакета
    if (keys.length) {
      const { error: remErr } = await supabaseAdmin
        .storage
        .from('attachments')
        .remove(keys)
      if (remErr) return NextResponse.json({ error: 'Failed to remove storage objects' }, { status: 500 })
    }

    // 3) Удаляем запись сообщения, убедившись, что она принадлежит юзеру
    const { error: delErr } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('owner', user.id)

    if (delErr) return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })

    return NextResponse.json({ ok: true, deleted: messageId, removedFiles: keys.length })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
