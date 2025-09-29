// app/api/uploads/create-url/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

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

    const { filename, contentType } = await req.json().catch(() => ({} as any))
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }
    const cleanName = filename.replace(/[^\w.\-]+/g, '_')
    const objectKey = `${user.id}/${Date.now()}_${cleanName}`

    const { data, error } = await supabaseAdmin.storage
      .from('attachments')
      .createSignedUploadUrl(objectKey)

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
    }

    return NextResponse.json({
      url: data.signedUrl,
      path: objectKey,
      contentType: contentType || 'application/octet-stream'
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 })
  }
}
