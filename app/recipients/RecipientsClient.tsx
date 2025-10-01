'use client';

import { useEffect, useState } from "react";

type Recipient = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export default function RecipientsClient() {
  const [items, setItems] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/recipients", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Ошибка загрузки");
      setItems(j.items || []);
    } catch (e: any) {
      setErr(e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function addRecipient() {
    setErr(null);
    try {
      const r = await fetch("/api/recipients", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Не удалось создать");
      setItems(prev => [j.item, ...prev]);
      setName(""); setEmail("");
    } catch (e: any) {
      setErr(e.message || "Ошибка");
    }
  }

  async function removeRecipient(id: string) {
    setErr(null);
    try {
      const r = await fetch(`/api/recipients/${id}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Не удалось удалить");
      setItems(prev => prev.filter(x => x.id !== id));
    } catch (e: any) {
      setErr(e.message || "Ошибка");
    }
  }

  return (
    <div className="wrap py-8 grid gap-6">
      <h1 className="title">Получатели</h1>

      <div className="card grid gap-3 max-w-xl">
        <div className="grid gap-2">
          <label className="text-sm">Имя</label>
          <input
            className="border rounded-md px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Например, Иван Петров"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Email</label>
          <input
            className="border rounded-md px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ivan@example.com"
            type="email"
            inputMode="email"
            autoComplete="email"
          />
        </div>
        <div>
          <button className="btn" onClick={addRecipient} disabled={loading}>
            {loading ? "Сохраняю…" : "Добавить получателя"}
          </button>
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>

      <div className="card">
        <div className="p-4 border-b font-medium">Список</div>
        <div className="divide-y">
          {loading && items.length === 0 && (
            <div className="p-4 text-sm text-gray-500">Загрузка…</div>
          )}
          {!loading && items.length === 0 && (
            <div className="p-4 text-sm text-gray-500">Пока пусто.</div>
          )}
          {items.map(r => (
            <div key={r.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-sm text-gray-500">{r.email}</div>
              </div>
              <button
                className="btn secondary"
                onClick={() => removeRecipient(r.id)}
                title="Удалить"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
