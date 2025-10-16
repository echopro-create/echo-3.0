"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-24">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Войти</h1>
      <p className="mb-6 opacity-80">Введите почту, мы пришлём код. Пароли нам не нужны.</p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm">
        <label className="block text-sm">
          Почта
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </label>
        <button type="submit" className="w-full rounded-xl border border-[var(--ring)] px-4 py-2 text-sm hover:opacity-100 opacity-90">
          Получить код
        </button>
        {sent && <p className="text-sm text-green-600">Письмо отправлено. Проверьте почту.</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>

      <p className="mt-4 text-xs opacity-70">
        Контент шифруется на вашем устройстве, сервер видит только зашифрованные данные.
      </p>
    </main>
  );
}
