import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Серверный клиент Supabase.
 * - На серверных страницах (RSC) cookies только читаем.
 * - В Route Handlers / Server Actions set/delete сработают нормально.
 * - В RSC попытки set/delete молча игнорируются, чтобы не падать.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies(); // sync, без await в Next 15

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // В RSC это кинет ошибку — глушим. В Route Handler пройдет.
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // noop в среде, где менять куки нельзя
          }
        },
        remove(name: string, options: CookieOptions) {
          // Аналогично — тихо игнорируем в RSC.
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            // noop
          }
        },
      },
    }
  );

  return supabase;
}
