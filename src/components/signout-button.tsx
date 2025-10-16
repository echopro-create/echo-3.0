"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  className?: string;
  label?: string;
};

export function SignOutButton({ className = "", label = "Выйти" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    if (loading) return;
    setErr(null);
    setLoading(true);
    const s = createClient();
    try {
      const { error } = await s.auth.signOut();
      if (error) throw error;
      // Обновим серверные компоненты и шапку
      router.replace("/");
      router.refresh();
    } catch (e) {
      setErr("Не получилось выйти. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium
                   ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                   disabled:cursor-not-allowed disabled:opacity-60"
        aria-busy={loading || undefined}
        aria-live="polite"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="size-4 animate-spin"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                opacity="0.25"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            Выходим…
          </span>
        ) : (
          label
        )}
      </button>

      {err && (
        <p className="mt-2 text-xs text-red-600" role="status">
          {err}
        </p>
      )}
    </div>
  );
}
