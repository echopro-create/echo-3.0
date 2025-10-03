// app/s/[token]/Client.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type FileView = {
  id: string;
  url: string | null;
  mime: string | null;
  bytes: number | null;
  name: string;
  created_at: string | null;
};

type ShareMeta = {
  expires_at: string | null;
  views: number;
  max_views: number | null;
  revoked: boolean;
  password_protected: boolean;
};

type MessageView = {
  id: string;
  kind: "text" | "audio" | "video" | "files";
  content: string | null;
  delivery_mode: "heartbeat" | "date";
  deliver_at: string | null;
  created_at: string | null;
};

export default function PublicShareClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [share, setShare] = useState<ShareMeta | null>(null);
  const [message, setMessage] = useState<MessageView | null>(null);
  const [files, setFiles] = useState<FileView[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const storageKey = useMemo(() => `echo-share-pw:${token}`, [token]);

  function humanBytes(n?: number | null) {
    if (!n || n <= 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0; let x = n;
    while (x >= 1024 && i < units.length - 1) { x /= 1024; i++; }
    return `${x.toFixed(1)} ${units[i]}`;
  }
  function safeDate(s: string | null) {
    if (!s) return "—";
    const t = new Date(s);
    return Number.isNaN(t.getTime()) ? "—" : t.toLocaleString("ru-RU");
  }

  async function load(withPassword?: string) {
    setLoading(true);
    setError(null);
    try {
      const q = withPassword ? `?pw=${encodeURIComponent(withPassword)}` : "";
      const res = await fetch(`/api/public-share/${token}${q}`, { cache: "no-store" });
      const j = await res.json().catch(() => ({} as any));

      if (!res.ok || !j?.ok) {
        if (res.status === 401) throw new Error("need_password"); // требуется пароль или неверный
        if (res.status === 404) throw new Error("not_found");
        if (res.status === 410) throw new Error("gone"); // expired/revoked/over views
        throw new Error(String(j?.error || `HTTP ${res.status}`));
      }

      setShare(j.share as ShareMeta);
      setMessage(j.message as MessageView);
      setFiles((j.files as FileView[]) || []);
    } catch (e: any) {
      setShare(null);
      setMessage(null);
      setFiles([]);
      const code = String(e?.message || e);
      setError(code);
    } finally {
      setLoading(false);
    }
  }

  // первичная загрузка: пробуем пароль из sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey) || "";
    if (saved) {
      setPw(saved);
      load(saved);
    } else {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // после показа формы кладем фокус в поле
  useEffect(() => {
    if (needsPassword(error) && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [error]);

  const formErrorText = (() => {
    if (error === "need_password") return "Нужен пароль, либо введён неверный.";
    if (error === "not_found") return "Ссылка не найдена.";
    if (error === "gone") return "Ссылка недоступна: истекла, отозвана или превышен лимит просмотров.";
    return error ? String(error) : "";
  })();

  function needsPassword(err: string | null) {
    return err === "need_password";
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!pw.trim()) {
      setError("need_password");
      return;
    }
    setSubmitting(true);
    // пробуем запрос с паролем
    await load(pw.trim());
    // если всё ок, error больше не «need_password», сохраняем пароль до конца сессии
    setSubmitting(false);
    if (!needsPassword(error)) {
      sessionStorage.setItem(storageKey, pw.trim());
    }
  }

  return (
    <div className="container py-8" style={{ maxWidth: 900 }}>
      <h1 className="text-2xl font-semibold mb-4">Публичный просмотр</h1>

      {/* карточка с ошибками общего вида */}
      {!needsPassword(error) && error && (
        <div className="card p-4 text-red-600 max-w-xl mb-4" role="alert">
          {formErrorText}
        </div>
      )}

      {/* форма пароля */}
      {needsPassword(error) && (
        <div
          className="card p-4 grid gap-3 max-w-xl mb-4"
          role="dialog"
          aria-labelledby="pw-title"
          aria-describedby="pw-desc"
        >
          <div id="pw-title" className="font-medium">Доступ по паролю</div>
          <div id="pw-desc" className="text-sm opacity-70">
            Введите пароль от этой ссылки. Мы не сохраняем его на сервере, только в памяти вкладки.
          </div>

          <form onSubmit={submit} className="grid gap-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type={showPw ? "text" : "password"}
                className="input flex-1"
                placeholder="Пароль"
                aria-label="Пароль"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                className="btn secondary"
                aria-pressed={showPw}
                onClick={() => setShowPw((v) => !v)}
                title={showPw ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPw ? "Скрыть" : "Показать"}
              </button>
            </div>

            {formErrorText && (
              <div className="text-sm text-red-600" role="alert">
                {formErrorText}
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? "Проверяем…" : "Открыть"}
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setPw("");
                  sessionStorage.removeItem(storageKey);
                  // перезагружаем форму, если до этого был неверный пароль
                  setError("need_password");
                  inputRef.current?.focus();
                }}
              >
                Очистить
              </button>
            </div>
          </form>
        </div>
      )}

      {/* контент при успехе */}
      {!needsPassword(error) && !error && (
        <>
          <div className="card p-4 grid gap-2 max-w-xl mb-4">
            <div className="text-sm opacity-70">
              Просмотры: {share?.views ?? 0}
              {share?.max_views ? ` / лимит ${share.max_views}` : ""} ·
              Истекает: {safeDate(share?.expires_at ?? null)} ·
              Пароль: {share?.password_protected ? "включен" : "выключен"}
            </div>
            {message?.content && (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>

          {files.length > 0 && (
            <div className="card p-4 grid gap-3">
              <div className="font-medium">Вложения</div>
              <ul className="grid gap-4">
                {files.map((f) => (
                  <li key={f.id} className="grid gap-2">
                    <div className="text-sm flex items-center justify-between gap-3">
                      <span className="truncate">
                        {f.name}
                        {f.bytes ? ` · ${humanBytes(f.bytes)}` : ""}
                        {f.created_at ? ` · ${safeDate(f.created_at)}` : ""}
                      </span>
                      {f.url && (
                        <a className="btn secondary" href={f.url} target="_blank" rel="noreferrer">
                          Открыть
                        </a>
                      )}
                    </div>

                    {f.url && f.mime?.startsWith("audio") && (
                      <audio controls src={f.url} className="w-full" />
                    )}
                    {f.url && f.mime?.startsWith("video") && (
                      <video controls src={f.url} className="w-full rounded-xl bg-black/5" />
                    )}
                    {f.url && f.mime?.startsWith("image/") && (
                      <img src={f.url} alt={f.name} className="max-w-full rounded-xl border" />
                    )}
                    {f.url && f.mime === "application/pdf" && (
                      <iframe
                        src={f.url}
                        className="w-full rounded-xl"
                        style={{ minHeight: 420, background: "#fafafa", border: "1px solid #eee" }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {loading && <div className="text-sm opacity-70">Загрузка…</div>}
    </div>
  );
}
