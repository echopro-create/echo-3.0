import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies(); // в Next 15 это Promise

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string): string | undefined {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions): void {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions): void {
          cookieStore.set(name, "", { ...options, expires: new Date(0) });
        },
      },
    }
  );
}
