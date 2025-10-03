// tests/public-share.api.spec.ts
import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

test.describe("Public Share API checks @public-share", () => {
  test("expired returns 410, wrong password 401, ok with password 200", async ({ request }) => {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      test.skip(true, "No service role envs, skipping");
      return;
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    const { data: anyProfile } = await admin.from("profiles").select("id").limit(1).maybeSingle();
    const userId = anyProfile!.id as string;

    const { data: msg } = await admin
      .from("messages")
      .insert({ user_id: userId, kind: "text", content: "TTL тест", delivery_mode: "date", deliver_at: new Date().toISOString() })
      .select("id")
      .single();

    const tokenFresh = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    const tokenExpired = crypto.randomUUID().replace(/-/g, "").slice(0, 24);

    // пароли
    const saltHex = "aa".repeat(16);
    const passHash = await sha256Hex("qwerty", saltHex);

    await admin.from("shares").insert([
      {
        token: tokenFresh,
        message_id: msg!.id,
        expires_at: new Date(Date.now() + 3600_000).toISOString(),
        password_hash: passHash,
        password_salt: saltHex,
        views: 0,
      },
      {
        token: tokenExpired,
        message_id: msg!.id,
        expires_at: new Date(Date.now() - 3600_000).toISOString(),
        views: 0,
      },
    ]);

    // 410 на просроченную
    const rExpired = await request.get(`${APP_ORIGIN}/api/public-share/${tokenExpired}`);
    expect(rExpired.status()).toBe(410);

    // 401 без пароля
    const r401 = await request.get(`${APP_ORIGIN}/api/public-share/${tokenFresh}`);
    expect(r401.status()).toBe(401);

    // 200 с паролем
    const r200 = await request.get(`${APP_ORIGIN}/api/public-share/${tokenFresh}?pw=${encodeURIComponent("qwerty")}`);
    expect(r200.status()).toBe(200);
    const j = await r200.json();
    expect(j?.ok).toBe(true);
  });
});

async function sha256Hex(password: string, saltHex: string) {
  const enc = new TextEncoder();
  const bytes = new Uint8Array([...enc.encode(password), ...hexToBytes(saltHex)]);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function hexToBytes(hex: string) {
  const out = [];
  for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16));
  return new Uint8Array(out);
}
