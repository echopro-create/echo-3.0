import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Body = {
  kind: "text" | "voice" | "video" | "file";
  body_text?: string;
  trigger_kind: "datetime" | "event" | "afterlife";
  send_at?: string | null;
  event_code?: string | null;
  afterlife_ack?: boolean;
  recipients: string[];
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json()) as Body;

  if (!body?.kind || !body?.trigger_kind) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
    return NextResponse.json({ error: "no_recipients" }, { status: 400 });
  }

  const isDatetime = body.trigger_kind === "datetime";
  const isAfterlife = body.trigger_kind === "afterlife";
  const sendAtISO =
    isDatetime && body.send_at ? new Date(body.send_at).toISOString() : null;

  const initialStatus =
    isDatetime && sendAtISO
      ? "scheduled"
      : isAfterlife && body.afterlife_ack
      ? "scheduled"
      : "draft";

  const { data: msg, error: insErr } = await supabase
    .from("messages")
    .insert({
      user_id: user.id,
      kind: body.kind,
      body_text: body.kind === "text" ? body.body_text ?? "" : null,
      trigger_kind: body.trigger_kind,
      send_at: sendAtISO,
      event_code: body.trigger_kind === "event" ? body.event_code : null,
      afterlife_ack: isAfterlife ? !!body.afterlife_ack : false,
      status: initialStatus,
    })
    .select("*")
    .single();

  if (insErr || !msg) {
    return NextResponse.json({ error: insErr?.message ?? "insert_failed" }, { status: 500 });
  }

  const rows = body.recipients.map((email) => ({ message_id: msg.id, email }));
  const { error: recErr } = await supabase.from("message_recipients").insert(rows);
  if (recErr) {
    return NextResponse.json({ error: recErr.message }, { status: 500 });
  }

  const storagePrefix = `attachments/${user.id}/${msg.id}/`;

  return NextResponse.json({ id: msg.id, storagePrefix, status: initialStatus });
}
