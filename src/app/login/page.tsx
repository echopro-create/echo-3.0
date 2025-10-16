"use client";

import { useId, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function LoginPage() {
  const emailId = useId();
  const helpId = useId();
  const statusId = useId();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailOk = useMemo(() => isValidEmail(email), [email]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!emailOk || loading) return;

    setErr(null);
    setSent(false);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) {
        setErr(error.message || "Не удалось отправить письмо.");
        setSent(false);
      } else {
        setSent(true);
      }
    } catch {
      setErr("Не удалось отправить письмо. Проверьте соединение и попробуйте ещё раз.");
      setSent(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-24">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Войти</h1>
      <p className="mb-6 opacity-80">
        Введите почту — отправим одноразовую ссылку. Пароли здесь не водятся.
      </p>

      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-4 rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm"
        aria-describedby={`${helpId} ${statusId}`}
      >
        <div className="grid gap-2">
          <label htmlFor={emailId} className="text-sm font-medium">
            Почта
          </label>
          <input
            id={emailId}
            name="email"
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
            aria-invalid={email.length > 0 && !emailOk ? true : undefined}
            aria-describedby={helpId}
          />
          <p id={helpId} className="text-xs opacity-70">
            Мы отправим ссылку для входа. Срок действия ограничен.
          </p>
        </div>

        <button
          type="submit"
          disabled={!emailOk || loading}
          aria-busy={loading}
          className="w-full inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium
                     bg-[color:var(--fg)] text-[color:var(--bg)]
                     hover:opacity-90 disabled:opacity-50
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {loading ? "Отправляем…" : "Получить ссылку"}
        </button>

        <div id={statusId} aria-live="polite" className="min-h-[1.25rem]">
          {sent && !err && (
            <p className="text-sm text-green-600">
              Письмо отправлено. Проверьте почту и перейдите по ссылке.
            </p>
          )}
          {err && (
            <p role="alert" className="text-sm text-red-600">
              {err}
            </p>
          )}
        </div>
      </form>

      <p className="mt-4 text-xs opacity-70">
        Контент шифруется на вашем устройстве, сервер видит только зашифрованные данные.
      </p>
    </main>
  );
}
