"use client";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  return (
    <button
      onClick={async () => {
        const s = createClient();
        await s.auth.signOut();
        window.location.href = "/";
      }}
      className="text-sm opacity-80 hover:opacity-100"
    >
      Выйти
    </button>
  );
}
