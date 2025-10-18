import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const key = process.env.CRON_SECRET;
  const hdr = req.headers.get("x-cron-key");
  if (!key || hdr !== key) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("queue_due_messages");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ queued: data ?? 0 });
}
