// tests/public-share.spec.ts
import { test, expect, request } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

test.describe("Public Share @public-share", () => {
  test("create message -> create share (pw+limit) -> open anon -> view -> exceed -> 410", async ({ browser }) => {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      test.skip(true, "No service role envs, skipping");
      return;
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    // 1) seed: user, message
    // Создадим «сервисное» сообщение на существующего тест-пользователя либо на заглушку
    // В реальной БД должен быть profiles/id либо RLS для анонима на insert запрещён.
    // Тут вставим напрямую сервисной ролью и привяжем к любому user_id из profiles.
    const { data: anyProfile } = await admin.from("profiles").select("id").limit(1).maybeSingle();
    expect(anyProfile?.id, "Need at least one profile row").toBeTruthy();
    const userId = anyProfile!.id as string;

    const { data: msg, error: msgErr } = await admin
      .from("messages")
      .insert({
        user_id: userId,
        kind: "text",
        content: "Тестовое послание E2E",
        delivery_mode: "date",
        deliver_at: new Date().toISOString(),
      })
      .select("id, created_at")
      .single();
    expect(msgErr?.message || "", "message insert error").toBe("");

    // 2) share with password and limit=1
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    const expires_at = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
    // Соль/хэш как в API
    const saltHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const enc = new TextEncoder();
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new Uint8Array([...enc.encode("pass123"), ...hexToBytes(saltHex)])
    );
    const hashHex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { error: shareErr } = await admin.from("shares").insert({
      token,
      message_id: msg.id,
      expires_at,
      max_views: 1,
      password_hash: hashHex,
      password_salt: saltHex,
      views: 0,
    });
    expect(shareErr?.message || "", "share insert error").toBe("");

    const anonCtx = await browser.newContext(); // инкогнито
    const page = await anonCtx.newPage();

    // 3) первый заход без пароля -> форма
    await page.goto(`${APP_ORIGIN}/s/${token}`);
    await expect(page.getByText("Доступ по паролю")).toBeVisible();

    // вводим пароль
    await page.getByPlaceholder("Пароль").fill("pass123");
    await page.getByRole("button", { name: "Открыть" }).click();

    // 4) видим контент
    await expect(page.getByText("Публичное послание")).toBeVisible();
    await expect(page.getByText("Тестовое послание E2E")).toBeVisible();

    // 5) превышаем лимит: ещё раз обновляем без кэша
    await page.reload({ waitUntil: "networkidle" });
    // Должен быть «Ссылка недоступна» (410)
    await expect(page.getByText("Ссылка недоступна")).toBeVisible();

    await anonCtx.close();
  });
});

function hexToBytes(hex: string) {
  const out = [];
  for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16));
  return new Uint8Array(out);
}
