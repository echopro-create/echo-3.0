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
  const saltBytes = new Uint8Array(saltHex.match(/.{1,2}/g)?.map((h) => parseInt(h, 16)) || []);
  const toHash = new Uint8Array(passBytes.length + saltBytes.length);
  toHash.set(passBytes, 0);
  toHash.set(saltBytes, passBytes.length);
  const digest = await crypto.subtle.digest("SHA-256", toHash);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

function getUA(req: Request) {
  return req.headers.get("user-agent") || "";
}

// ===== notification (best-effort, never breaks the response) =====
async function tryNotifyFirstView(opts: {
  admin: ReturnType<typeof createAdminClient>;
  wasFirstView: boolean;
  messageId: string;
  messageKind: string | null;
  messageCreatedAt: string | null;
  shareToken: string;
  req: Request;
}) {
  try {
    if (!opts.wasFirstView) return; // только при первом просмотре

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM || "echo@echoproject.space";
    const overrideTo = process.env.NOTIFY_OWNER_EMAIL_OVERRIDE || "";

    if (!apiKey && !overrideTo) {
      // нет ни API ключа, ни тестового адреса — тихо выходим
      return;
    }

    // 1) Пытаемся понять email владельца сообщения
    let ownerEmail: string | null = null;

    if (overrideTo) {
      ownerEmail = overrideTo;
    } else {
      // а) пробуем messages.owner_email (если колонка есть)
      let msgOwnerEmail: string | null = null;
      try {
        const { data, error } = await opts.admin
          .from("messages")
          .select("owner_email")
          .eq("id", opts.messageId)
          .maybeSingle();
        if (!error) msgOwnerEmail = (data as any)?.owner_email ?? null;
      } catch {
        /* ignore */
      }
      if (msgOwnerEmail) ownerEmail = msgOwnerEmail;

      // б) пробуем messages.user_id → profiles.email
      if (!ownerEmail) {
        try {
          const { data: m, error: mErr } = await opts.admin
            .from("messages")
            .select("user_id")
            .eq("id", opts.messageId)
            .maybeSingle();
          const userId = (m as any)?.user_id as string | undefined;
          if (!mErr && userId) {
            const { data: p, error: pErr } = await opts.admin
              .from("profiles")
              .select("email")
              .eq("id", userId)
              .maybeSingle();
            if (!pErr) {
              ownerEmail = (p as any)?.email ?? null;
            }
          }
        } catch {
          /* ignore */
        }
      }
    }

    if (!ownerEmail) return; // не смогли вычислить куда отправлять — тихо выходим

    // 2) Собираем письмо
    const subject = "ECHO: первое открытие публичной ссылки";
    const ip = getIP(opts.req);
    const ua = getUA(opts.req);
    const viewedAt = new Date().toISOString();
    const kindText =
      opts.messageKind === "text"
        ? "Текст"
        : opts.messageKind === "audio"
        ? "Аудио"
        : opts.messageKind === "video"
        ? "Видео"
        : opts.messageKind === "files"
        ? "Файлы"
        : "Послание";
    const createdText = opts.messageCreatedAt
      ? new Date(opts.messageCreatedAt).toLocaleString("ru-RU")
      : "—";
    const link = `${process.env.NEXT_PUBLIC_SITE_ORIGIN || ""}/s/${encodeURIComponent(opts.shareToken)}`;

    const html =
      `<p>Ваше послание открыли впервые.</p>` +
      `<p><b>Тип:</b> ${kindText}<br/>` +
      `<b>Создано:</b> ${createdText}<br/>` +
      `<b>Первый просмотр:</b> ${new Date(viewedAt).toLocaleString("ru-RU")}<br/>` +
      `<b>Ссылка:</b> <a href="${link}">${link}</a><br/>` +
      `<b>IP:</b> ${ip}<br/>` +
      `<b>UA:</b> ${ua}</p>`;

    const payload = {
      from,
      to: [ownerEmail],
      subject,
      html,
    };

    // 3) Отправляем через Resend API (если есть ключ)
    if (apiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch(() => {
        /* ignore email errors */
      });
    }
  } catch {
    // Никогда не валим основной ответ из-за письма
  }
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
    const prevViews = share.views ?? 0;
    const nextViews = prevViews + 1;
    {
      const { error: vuErr } = await admin.from("shares").update({ views: nextViews }).eq("id", share.id);
      if (vuErr) {
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
      (files || []).map(async (f) => {
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

    // 7) уведомление при первом просмотре (best-effort, не ломает ответ)
    tryNotifyFirstView({
      admin,
      wasFirstView: prevViews === 0,
      messageId: msg.id,
      messageKind: (msg as any)?.kind ?? null,
      messageCreatedAt: (msg as any)?.created_at ?? null,
      shareToken: token,
      req,
    }).catch(() => {});

    return jsonOk({
      ok: true,
      share: {
        expires_at: share.expires_at,
        views: nextViews,
        max_views: share.max_views ?? null,
        revoked: !!share.revoked,
        password_protected: !!share.password_hash,
        // last_view_at может появиться в будущем; клиент обработает отсутствующее поле
      },
      message: {
        id: msg.id,
        kind: (msg as any)?.kind,
        content: (msg as any)?.content,
        delivery_mode: (msg as any)?.delivery_mode,
        deliver_at: (msg as any)?.deliver_at,
        created_at: (msg as any)?.created_at,
      },
      files: signed,
    });
  } catch (e: any) {
    return jsonErr(500, e?.message || "Server error");
  }
}
