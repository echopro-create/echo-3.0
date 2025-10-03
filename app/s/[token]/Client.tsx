// app/s/[token]/Client.tsx
"use client";

import React from "react"; // страховка для JSX-парсера SWC/TS
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
  // может отсутствовать в API — обрабатываем как необязательное
  last_view_at?: string | null;
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
    let i = 0;
    let x = n;
    while (x >= 1024 && i < units.length - 1) {
      x /= 1024;
      i++;
    }
    const val = x >= 10 ? Math.round(x) : +x.toFixed(1);
    return `${val} ${units[i]}`;
  }

  function safeDate(s: string | null) {
    if (!s) return "—";
    const t = new Date(s);
    return Number.isNaN(t.getTime()) ? "—" : t.toLocaleString("ru-RU");
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function computeStatus(s: ShareMeta | null): {
    code: "active" | "expired" | "revoked" | "overlimit" | "unknown";
    label: string;
    hint?: string;
  } {
    if (!s) return { code: "unknown", label: "Неизвестно" };
    if (s.revoked) return { code: "revoked", label: "Отозвана", hint: "Владелец отключил доступ" };
    if (s.max_views != null && s.views >= s.max_views)
      return { code: "overlimit", label: "Лимит исчерпан", hint: "Достигнуто максимальное число просмотров" };
    if (s.expires_at && new Date(s.expires_at).getTime() <= new Date(nowIso()).getTime())
      return { code: "expired", label: "Просрочена", hint: "Истек срок действия ссылки" };
    return { code: "active", label: "Активна" };
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
    await load(pw.trim());
    setSubmitting(false);
    // читаем актуальное состояние в следующем тике
    setTimeout(() => {
      if (!needsPassword(error)) {
        sessionStorage.setItem(storageKey, pw.trim());
      }
    }, 0);
  }

  function copyLink() {
    const link = `${location.origin}/s/${encodeURIComponent(token)}`;
    navigator.clipboard
      .writeText(link)
      .catch(() => {
        // eslint-disable-next-line no-alert
        prompt("Скопируйте ссылку вручную:", link);
      });
  }

  const status = computeStatus(share);

  return (
    <main className="px-4 py-6" style={{ maxWidth: 980, margin: "0 auto" }}>
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Публичное послание</h1>
        <p className="text-sm opacity-70">
          Эта страница открывает доступ к посланию, которым с вами поделились.
        </p>
      </header>

      {/* Глобальные ошибки (кроме 401) */}
      {!needsPassword(error) && error && (
        <section className="card p-4 max-w-xl mb-4" role="alert" aria-live="polite">
          <StatusBlock
            variant={error === "not_found" ? "error" : error === "gone" ? "warning" : "error"}
            title={
              error === "not_found"
                ? "Ссылка не найдена"
                : error === "gone"
                ? "Ссылка недоступна"
                : "Ошибка"
            }
            hint={
              error === "not_found"
                ? "Проверьте адрес ссылки или попросите отправителя создать новую."
                : error === "gone"
                ? "Ссылка просрочена, отозвана или достигнут лимит просмотров."
                : "Не удалось открыть ссылку. Попробуйте позже."
            }
          />

          <div className="flex gap-2 mt-3">
            <button
              className="btn"
              onClick={() => {
                try {
                  window.close();
                } catch {
                  /* ignore */
                }
                location.href = "/";
              }}
            >
              Закрыть
            </button>
            <a className="btn secondary" href="/">
              На главную
            </a>
          </div>
        </section>
      )}

      {/* Форма пароля */}
      {needsPassword(error) && (
        <section
          className="card p-4 grid gap-3 max-w-xl mb-4"
          role="dialog"
          aria-labelledby="pw-title"
          aria-describedby="pw-desc"
        >
          <div id="pw-title" className="font-medium">
            Доступ по паролю
          </div>
          <div id="pw-desc" className="text-sm opacity-70">
            Введите пароль от этой ссылки. Мы не сохраняем его на сервере, он хранится только в памяти этой вкладки.
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
                inputMode="text"
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

            {error && (
              <div className="text-sm text-red-600" role="alert">
                Нужен пароль, либо введён неверный.
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
                  setError("need_password");
                  inputRef.current?.focus();
                }}
              >
                Очистить
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Успешный контент */}
      {!needsPassword(error) && !error && (
        <>
          {/* Статус-панель */}
          <section className="card p-4 grid gap-2 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <BadgeStatus code={status.code} label={status.label} />
                <span className="text-sm opacity-70">
                  Просмотры: {share?.views ?? 0}
                  {share?.max_views != null ? ` / лимит ${share.max_views}` : ""}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm opacity-70">
                  Истекает: {safeDate(share?.expires_at ?? null)}
                </span>
                <span className="text-sm opacity-70">
                  Пароль: {share?.password_protected ? "включён" : "выключен"}
                </span>
                {share?.last_view_at ? (
                  <span className="text-sm opacity-70">
                    Последний просмотр: {safeDate(share.last_view_at)}
                  </span>
                ) : null}
                <button className="btn secondary" onClick={copyLink} title="Скопировать ссылку">
                  Скопировать ссылку
                </button>
              </div>
            </div>
            {status.hint && <div className="text-sm opacity-70">{status.hint}</div>}
          </section>

          {/* Текст послания, если есть */}
          {message?.content && (
            <section className="card p-4 grid gap-2 mb-4">
              <div className="text-sm opacity-70">
                Тип:{" "}
                {message.kind === "text"
                  ? "Текст"
                  : message.kind === "audio"
                  ? "Аудио"
                  : message.kind === "video"
                  ? "Видео"
                  : "Файлы"}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                {message.content}
              </div>
            </section>
          )}

          {/* Вложения */}
          {files.length > 0 && (
            <section className="card p-4 grid gap-3">
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
            </section>
          )}
        </>
      )}

      {loading && <div className="text-sm opacity-70">Загрузка…</div>}
    </main>
  );
}

/* ---------------- UI helpers ---------------- */

function BadgeStatus({
  code,
  label,
}: {
  code: "active" | "expired" | "revoked" | "overlimit" | "unknown";
  label: string;
}) {
  const palette: Record<string, string> = {
    active: "bg-green-100 text-green-700 border-green-200",
    expired: "bg-gray-100 text-gray-700 border-gray-200",
    revoked: "bg-red-100 text-red-700 border-red-200",
    overlimit: "bg-amber-100 text-amber-800 border-amber-200",
    unknown: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };
  const cls = palette[code] || palette.unknown;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function StatusBlock({
  variant,
  title,
  hint,
}: {
  variant: "error" | "warning" | "info";
  title: string;
  hint?: string;
}) {
  const palette: Record<string, string> = {
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };
  const cls = palette[variant] || palette.info;
  return (
    <div className={`rounded-xl border p-3 ${cls}`}>
      <div className="font-medium">{title}</div>
      {hint ? <div className="text-sm opacity-80">{hint}</div> : null}
    </div>
  );
}
