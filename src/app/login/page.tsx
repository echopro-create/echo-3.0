"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: origin ? `${origin}/` : undefined,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main" className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
        Войти
      </h1>
      <p className="mt-3 text-[color:var(--muted)]">
        Мы отправим вам ссылку для входа на почту. Пароли не нужны.
      </p>

      {sent ? (
        <div className="mt-6 rounded-xl border border-black/10 bg-white/80 p-4 text-sm text-[color:var(--fg)]">
          Письмо отправлено. Проверьте почту и перейдите по ссылке.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-[color:var(--fg)]">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 outline-none ring-0 placeholder:text-[color:var(--muted)] focus:border-black/20"
              placeholder="you@example.com"
              aria-label="Email"
            />
          </label>

          {err && (
            <div
              role="alert"
              className="rounded-lg border border-black/10 bg-red-50/70 px-3 py-2 text-sm text-red-700"
            >
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-black/10 bg-black text-white px-4 py-2 text-sm transition hover:bg-black/90 disabled:opacity-60"
          >
            {loading ? "Отправляем..." : "Получить ссылку для входа"}
          </button>
        </form>
      )}
    </main>
  );
}
