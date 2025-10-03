import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Единые ответы с метками — удобно палить, кто отвечает (и чем)
function jsonOk(payload: any, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "x-echo-api": "public-share",
      "x-echo-auth": "service",
    },
  });
}
function jsonErr(status: number, message: string) {
  return jsonOk({ ok: false, error: message }, status);
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Server misconfig: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const token = parts[parts.length - 1] || "";
    if (!token || token.length < 12) return jsonErr(400, "Bad token");

    const admin = createAdminClient();

    // 1) Шара
    const { data: share, error: shareErr } = await admin
      .from("shares")
      .select("id, message_id, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (shareErr) return jsonErr(400, shareErr.message);
    if (!share) return jsonErr(404, "Not found");
    if (share.expires_at && new Date(share.expires_at).getTime() < Date.now()) {
      return jsonErr(410, "Link expired");
    }

    // 2) Сообщение
    const { data: msg, error: msgErr } = await admin
      .from("messages")
      .select("id, kind, content, delivery_mode, deliver_at, created_at")
      .eq("id", share.message_id)
      .maybeSingle();

    if (msgErr) return jsonErr(400, msgErr.message);
    if (!msg) return jsonErr(404, "Message missing");

    // 3) Файлы
    const { data: files, error: filesErr } = await admin
      .from("message_files")
      .select("id, path, mime, bytes, created_at")
      .eq("message_id", msg.id)
      .order("created_at", { ascending: true });

    if (filesErr) return jsonErr(400, filesErr.message);

    // 4) Подписанные ссылки (TTL 10 мин)
    const signed = await Promise.all(
      (files || []).map(async f => {
        const rawPath = f?.path || null;
        const name = rawPath?.split("/").pop() || rawPath || "file";
        let signedUrl: string | null = null;

        if (rawPath) {
          const { data: s, error: sErr } = await admin.storage
            .from("attachments")
            .createSignedUrl(rawPath, 600);
          if (!sErr) signedUrl = s?.signedUrl ?? null;
        }

        return {
          id: f.id,
          url: signedUrl,
          mime: (f.mime ?? "") || null,
          bytes: f.bytes ?? null,
          created_at: f.created_at ?? null,
          name,
        };
      })
    );

    return jsonOk({
      ok: true,
      message: {
        id: msg.id,
        kind: msg.kind,
        content: msg.content,
        delivery_mode: msg.delivery_mode,
        deliver_at: msg.deliver_at,
        created_at: msg.created_at,
      },
      files: signed,
    });
  } catch (e: any) {
    return jsonErr(500, e?.message || "Server error");
  }
}
