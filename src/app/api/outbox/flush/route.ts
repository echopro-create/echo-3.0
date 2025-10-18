import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMailConfigured, sendMail } from "@/lib/mailer";

type OutboxRow = {
  id: number;
  message_id: string;
  recipient_email: string;
  payload: {
    kind: "text" | "voice" | "video" | "file";
    body_text?: string;
    trigger_kind: "datetime" | "afterlife" | "event";
    send_at?: string | null;
    attachments?: { path: string; mime?: string | null; bytes: number }[];
  };
  try_count: number;
};

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("x-cron-key") !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!isMailConfigured()) {
    return NextResponse.json({ ok: true, sent: 0, note: "SMTP is not configured" });
  }

  const sb = createAdminClient();

  const { data: batch, error } = await sb
    .from("outbox")
    .select("id, message_id, recipient_email, payload, try_count")
    .eq("status", "pending")
    .lt("try_count", 5)
    .order("created_at", { ascending: true })
    .limit(25)
    .returns<OutboxRow[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;

  for (const row of batch ?? []) {
    try {
      const signedLinks: { name: string; url: string; bytes: number }[] = [];

      for (const a of row.payload.attachments ?? []) {
        const rel = a.path.replace(/^attachments\//, "");
        const signed = await sb.storage.from("attachments").createSignedUrl(rel, 60 * 60);
        if (signed.data?.signedUrl) {
          const name = rel.split("/").pop() || "file";
          signedLinks.push({ name, url: signed.data.signedUrl, bytes: Number(a.bytes || 0) });
        }
      }

      const subject = "Echo: запланированное послание";

      const textParts: string[] = [];
      if (row.payload.body_text) textParts.push(row.payload.body_text);
      if (signedLinks.length > 0) {
        textParts.push("", "Вложения:");
        for (const l of signedLinks) {
          textParts.push(`- ${l.name} (${(l.bytes / (1024 * 1024)).toFixed(1)} МБ): ${l.url}`);
        }
      }
      const text = textParts.join("\n");

      const htmlParts: string[] = [];
      if (row.payload.body_text) {
        htmlParts.push(
          `<div style="white-space:pre-wrap;font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;">${escapeHtml(
            row.payload.body_text
          )}</div>`
        );
      }
      if (signedLinks.length > 0) {
        htmlParts.push('<div style="margin-top:12px;font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;">');
        htmlParts.push(`<div style="color:#666;margin-bottom:4px;">Вложения:</div>`);
        htmlParts.push("<ul style='margin:0;padding-left:16px;'>");
        for (const l of signedLinks) {
          htmlParts.push(
            `<li><a href="${l.url}">${escapeHtml(l.name)}</a> <span style="color:#666;">(${(
              l.bytes / (1024 * 1024)
            ).toFixed(1)} МБ)</span></li>`
          );
        }
        htmlParts.push("</ul></div>");
      }
      const html = htmlParts.join("");

      await sendMail({ to: row.recipient_email, subject, text, html });

      await sb.from("outbox").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", row.id);
      sent += 1;
    } catch {
      const nextTry = row.try_count + 1;
      await sb
        .from("outbox")
        .update({ try_count: nextTry, status: nextTry >= 5 ? "failed" : "pending" })
        .eq("id", row.id);
    }
  }

  return NextResponse.json({ ok: true, sent });
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
