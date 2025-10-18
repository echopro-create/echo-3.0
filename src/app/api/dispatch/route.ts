import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const key = process.env.CRON_SECRET;
  const hdr = req.headers.get("x-cron-key");
  if (!key || hdr !== key) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = await createClient();

  const res1 = await supabase.rpc("queue_due_messages");
  const queuedDatetime = res1.data ?? 0;

  let queuedAfterlife = 0;
  try {
    const res2 = await supabase.rpc("queue_afterlife_messages");
    queuedAfterlife = res2.data ?? 0;
  } catch {
    queuedAfterlife = 0;
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
  const url = new URL("/api/outbox/flush", base);
  const flush = await fetch(url.toString(), {
    method: "POST",
    headers: { "x-cron-key": key },
  });

  let flushResult: unknown = null;
  try {
    flushResult = await flush.json();
  } catch {
    flushResult = { ok: false };
  }

  return NextResponse.json({ queuedDatetime, queuedAfterlife, flush: flushResult });
}
