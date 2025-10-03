// lib/supabase.server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Серверный клиент Supabase под Next 15.
 * - cookies() в твоей сборке — Promise, поэтому ждём его.
 * - В RSC запись/удаление куков глушим try/catch, чтобы не падать.
 * - В Route Handler / Server Action set/delete сработают нормально.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // <- важное отличие: await

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // В RSC менять нельзя — молча игнорируем.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            // В RSC менять нельзя — молча игнорируем.
          }
        },
      },
    }
  );

  return supabase;
}
