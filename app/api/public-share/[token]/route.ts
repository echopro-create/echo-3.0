// app/api/public-share/[token]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ===== helpers =====
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

// SHA-256( password || saltHex )
async function hashPassword(password: string, saltHex: string) {
  const enc = new TextEncoder();
  const passBytes = enc.encode(password);
  const saltBytes = new Uint8Array(saltHex.match(/.{1,2}/g)?.map(h => parseInt(h, 16)) || []);
  const toHash = new Uint8Array(passBytes.length + saltBytes.length);
  toHash.set(passBytes, 0);
  toHash.set(saltBytes, passBytes.length);
  const digest = await crypto.subtle.digest("SHA-256", toHash);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ===== primitive in-memory rate limit (per instance) =====
type Bucket = { ts: number; n: number };
const RL: Map<string, Bucket> = new Map();
const WINDOW_MS = 60_000;
const LIMIT = 60;

function rateLimit(ip: string, token: string) {
  const key = `${ip}|${token}`;
  const now = Date.now();
  const b = RL.get(key);
  if (!b || now - b.ts > WINDOW_MS) {
    RL.set(key, { ts: now, n: 1 });
    return true;
  }
  if (b.n >= LIMIT) return false;
  b.n += 1;
  return true;
}

function getIP(req: Request) {
  const fwd = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  return fwd || "0.0.0.0";
}

// ===== handler =====
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const token = parts[parts.length - 1] || "";
    if (!token || token.length < 12) return jsonErr(400, "Bad token");

    // rate-limit
    if (!rateLimit(getIP(req), token)) return jsonErr(429, "Too many requests");

    const admin = createAdminClient();

    // 1) share
    const { data: share, error: shareErr } = await admin
      .from("shares")
      .select("id, message_id, expires_at, revoked, views, max_views, password_hash, password_salt")
      .eq("token", token)
      .maybeSingle();

    if (shareErr) return jsonErr(400, shareErr.message);
    if (!share) return jsonErr(404, "Not found");

    // 410 на revoked/expired
    if (share.revoked) return jsonErr(410, "Link revoked");
    if (share.expires_at && new Date(share.expires_at).getTime() < Date.now()) {
      return jsonErr(410, "Link expired");
    }

    // 2) пароль (если установлен)
    const pwParam = url.searchParams.get("pw") || "";
    if (share.password_hash && share.password_salt) {
      if (!pwParam) return jsonErr(401, "Password required");
      const calc = await hashPassword(pwParam, share.password_salt);
      if (calc !== share.password_hash) return jsonErr(401, "Invalid password");
    }

    // 3) инкремент просмотров
    // Логика по ТЗ: увеличиваем views, а если лимит превышен — 410.
    const nextViews = (share.views ?? 0) + 1;
    {
      const { error: vuErr } = await admin
        .from("shares")
        .update({ views: nextViews })
        .eq("id", share.id);
      if (vuErr) {
        // не блокируем выдачу, но отмечаем ошибку инкремента
        return jsonErr(500, `Counter error: ${vuErr.message}`);
      }
    }
    if (share.max_views != null && nextViews > share.max_views) {
      return jsonErr(410, "View limit exceeded");
    }

    // 4) сообщение
    const { data: msg, error: msgErr } = await admin
      .from("messages")
      .select("id, kind, content, delivery_mode, deliver_at, created_at")
      .eq("id", share.message_id)
      .maybeSingle();

    if (msgErr) return jsonErr(400, msgErr.message);
    if (!msg) return jsonErr(404, "Message missing");

    // 5) файлы
    const { data: files, error: filesErr } = await admin
      .from("message_files")
      .select("id, path, mime, bytes, created_at")
      .eq("message_id", msg.id)
      .order("created_at", { ascending: true });

    if (filesErr) return jsonErr(400, filesErr.message);

    // 6) подписанные ссылки — минимум 10 минут
    const TTL_SEC = Math.max(600, Number(url.searchParams.get("ttl") || 600));
    const signed = await Promise.all(
      (files || []).map(async f => {
        const rawPath = f?.path || null;
        const name = rawPath?.split("/").pop() || rawPath || "file";
        let signedUrl: string | null = null;

        if (rawPath) {
          const { data: s, error: sErr } = await admin.storage.from("attachments").createSignedUrl(rawPath, TTL_SEC);
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
      share: {
        expires_at: share.expires_at,
        views: nextViews,
        max_views: share.max_views ?? null,
        revoked: !!share.revoked,
        password_protected: !!share.password_hash,
      },
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
    // Явное сообщение про сервисный ключ уже бросили в createAdminClient
    return jsonErr(500, e?.message || "Server error");
  }
}
