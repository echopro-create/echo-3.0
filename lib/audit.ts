// lib/audit.ts
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export function clientIp(req: Request) {
  const xf = req.headers.get('x-forwarded-for') || ''
  if (xf) return xf.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

type Subject = { type?: string | null; id?: string | null }

export async function audit(req: Request, userId: string, action: string, subject?: Subject, meta?: any) {
  try {
    await supabaseAdmin.from('audit_events').insert({
      user_id: userId,
      ip: clientIp(req),
      action,
      subject_type: subject?.type ?? null,
      subject_id: subject?.id ?? null,
      meta: meta ?? null,
    })
  } catch {
    // аудитор не должен ронять основной поток
  }
}
