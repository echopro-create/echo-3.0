"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Uploader({ messageId }: { messageId: string }) {
  const s = createClient();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null); setOk(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${messageId}/${crypto.randomUUID()}.${ext || "bin"}`;
      const { error } = await s.storage.from("attachments").upload(path, file, { upsert: false });
      if (error) { setErr(error.message); return; }
      // примитив: перезапишем content.attachments последним файлом
      await s.from("messages").update({
        content: {
          attachments: [{ path, name: file.name, size: file.size, type: file.type }],
        }
      }).eq("id", messageId);
    }
    setOk("Файлы загружены.");
  }

  return (
    <div className="rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-4">
      <label className="text-sm">Вложения
        <input type="file" multiple onChange={onFiles} className="mt-2 block text-sm" />
      </label>
      {ok && <p className="mt-2 text-sm text-green-600">{ok}</p>}
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}
