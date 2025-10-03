// app/api/_diag/health/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const auth = await supabase.auth.getUser();
    const messages = await supabase.from("messages").select("id").limit(1);
    const files = await supabase.from("message_files").select("path").limit(1);

    let signedUrl: string | null = null;
    let signedErr: string | null = null;

    const p = files.data?.[0]?.path;
    if (p) {
      const { data, error } = await supabase.storage.from("attachments").createSignedUrl(p, 60);
      signedUrl = data?.signedUrl ?? null;
      signedErr = error?.message ?? null;
    }

    return NextResponse.json({
      ok: true,
      auth: { user: auth.data?.user ?? null, error: auth.error?.message ?? null },
      db: {
        messages: { error: messages.error?.message ?? null },
        message_files: { error: files.error?.message ?? null }
      },
      storage: { tried: !!p, path: p ?? null, signedUrl, error: signedErr }
    }, { status: 200 });

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
