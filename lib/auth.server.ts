import { cookies } from "next/headers";

/**
 * Мини-проверка авторизации по наличию сервисных кук.
 * JWT не валидируем, нужен только факт входа.
 */
export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies(); // в Next 15 может быть Promise
  const names = [
    "sb-access-token",
    "sb-refresh-token",
    "access-token",
    "supabase-access-token",
  ];
  return names.some(n => !!jar.get(n)?.value);
}
