// app/components/AuthStatus.tsx
import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase.server"

export default async function AuthStatus() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) {
    // Не авторизован: показываем «Войти»
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-black hover:text-white transition"
        aria-label="Перейти к входу"
      >
        Войти
      </Link>
    )
  }

  // Авторизован: показываем индикатор с почтой
  const email = user.email ?? "аккаунт"
  return (
    <span
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm bg-white"
      aria-live="polite"
    >
      <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
      {email}
    </span>
  )
}
