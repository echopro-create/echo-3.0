import { cookies } from "next/headers";
import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Серверный Supabase-клиент c корректной работой cookies в App Router (Next 15).
 * • Уважает secure/sameSite/httpOnly
 * • Тихо игнорирует set/remove в местах, где Next запрещает мутировать заголовки (во время RSC-рендера)
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies(); // В Next 15 это Promise
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("SUPABASE: отсутствуют NEXT_PUBLIC_SUPABASE_URL или NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const isProd = process.env.NODE_ENV === "production";

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string): string | undefined {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions): void {
        // Во время чистого RSC-рендера Next не даёт мутировать заголовки — ловим и молчим.
        try {
          cookieStore.set(name, value, {
            ...options,
            httpOnly: true,
            sameSite: "lax",
            secure: isProd,
          });
        } catch {
          // no-op
        }
      },
      remove(name: string, options: CookieOptions): void {
        try {
          cookieStore.set(name, "", {
            ...options,
            httpOnly: true,
            sameSite: "lax",
            secure: isProd,
            expires: new Date(0),
          });
        } catch {
          // no-op
        }
      },
    },
  }) as unknown as SupabaseClient;
}
