// app/components/SharePassword.tsx
"use client";

import { useState } from "react";

export default function SharePassword(props: { token: string; passwordEnabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState<boolean>(props.passwordEnabled);

  const setPassword = async () => {
    const pwd = window.prompt("Введите пароль для ссылки (минимум 1 символ). Пусто — отмена.");
    if (pwd == null) return;
    if (!pwd.trim()) {
      alert("Пароль пустой.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`/api/shares/${props.token}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      setEnabled(true);
      alert("Пароль установлен.");
    } catch (e: any) {
      alert("Ошибка: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const clearPassword = async () => {
    if (!confirm("Снять пароль с ссылки?")) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/shares/${props.token}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "" }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      setEnabled(false);
      alert("Пароль снят.");
    } catch (e: any) {
      alert("Ошибка: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {!enabled ? (
        <button className="btn" disabled={busy} onClick={setPassword}>
          Поставить пароль
        </button>
      ) : (
        <>
          <span className="text-sm opacity-70">Пароль включён</span>
          <button className="btn secondary" disabled={busy} onClick={setPassword}>
            Изменить пароль
          </button>
          <button className="btn danger" disabled={busy} onClick={clearPassword}>
            Снять пароль
          </button>
        </>
      )}
    </div>
  );
}
