// lib/auth.server.ts
import { cookies } from "next/headers";

/**
 * Простая проверка факта авторизации по наличию одной из сервисных кук.
 * Мы НЕ проверяем валидность JWT здесь, только факт присутствия.
 */
export function isAuthenticated(): boolean {
  const jar = cookies();
  const names = [
    "sb-access-token",       // наш основной
    "sb-refresh-token",      // на всякий
    "access-token",          // запасные варианты
    "supabase-access-token",
  ];
  return names.some(n => !!jar.get(n)?.value);
}
