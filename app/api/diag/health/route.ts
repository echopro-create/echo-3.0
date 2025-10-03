import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const t0 = Date.now();
  const headers = { "Cache-Control": "no-store" };

  try {
    const supabase = await createSupabaseServerClient();

    // 1) БД: безопасный head-select без данных
    let dbOk = true;
    let dbErr: string | null = null;
    {
      const { error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .limit(1);
      if (error) {
        dbOk = false;
        dbErr = error.message;
      }
    }

    // 2) Storage: пробуем создать подписанную ссылку на фиктивный путь
    // Ничего не читаем и ничего не возвращаем наружу.
    let storageOk = true;
    let storageErr: string | null = null;
    {
      const { error } = await supabase.storage
        .from("attachments")
        .createSignedUrl("diag/_probe.txt", 30, { download: false });
      if (error) {
        storageOk = false;
        storageErr = error.message;
      }
    }

    const ok = dbOk && storageOk;
    const ms = Date.now() - t0;

    return NextResponse.json(
      {
        ok,
        ms,
        db: { ok: dbOk, error: dbErr },
        storage: { ok: storageOk, error: storageErr }
      },
      { status: ok ? 200 : 503, headers }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500, headers }
    );
  }
}
