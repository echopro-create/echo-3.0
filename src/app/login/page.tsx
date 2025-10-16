"use client";

import { useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailId = useId();
  const helpId = useId();
  const errId = useId();
  const okId = useId();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || loading) return;
    setErr(null);
    setSent(false);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) {
        setErr(error.message);
        setSent(false);
      } else {
        setSent(true);
      }
    } catch {
      setErr("Не удалось отправить код. Проверьте соединение и попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-24">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Войти</h1>
      <p className="mb-6 opacity-80">
        Введите почту — отправим одноразовый код. Пароли не нужны.
      </p>

      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-4 rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm"
        aria-describedby={sent ? okId : err ? errId : helpId}
      >
        <div className="grid gap-2">
          <label htmlFor={emailId} className="text-sm font-medium">
            Почта
          </label>
          <input
            id={emailId}
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            spellCheck={false}
            className="w-full rounded-xl border border-[var(--ring)] bg-transparent px-3 py-2 outline-none
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-invalid={!!err || undefined}
            aria-describedby={helpId}
          />
          <p id={helpId} className="text-xs opacity-70">
            Мы отправим код на указанный адрес. Срок действия ограничен.
          </p>
        </div>

        <button
          type="submit"
          disabled={!email || loading}
          aria-busy={loading}
          className="w-full inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium
                     bg-[color:var(--fg)] text-[color:var(--bg)]
                     hover:opacity-90 disabled:opacity-50
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {loading ? "Отправляем…" : "Получить код"}
        </button>

        {sent && (
          <p
            id={okId}
            role="status"
            aria-live="polite"
            className="text-sm text-green-600"
          >
            Письмо отправлено. Проверьте почту и перейдите по ссылке из письма.
          </p>
        )}

        {err && (
          <p
            id={errId}
            role="alert"
            aria-live="assertive"
            className="text-sm text-red-600"
          >
            {err}
          </p>
        )}
      </form>

      <p className="mt-4 text-xs opacity-70">
        Контент шифруется на вашем устройстве, сервер видит только зашифрованные данные.
      </p>
    </main>
  );
}
