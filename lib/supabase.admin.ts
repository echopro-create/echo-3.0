// lib/supabase.admin.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Серверный админ-клиент (service role).
 * Использовать ТОЛЬКО на сервере (RSC/route handlers).
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Server misconfig: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
