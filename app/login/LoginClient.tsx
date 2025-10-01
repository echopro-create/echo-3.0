'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase.client';

type Phase = 'email' | 'code';

export default function LoginClient() {
  const sp = useSearchParams();
  const next = useMemo(() => sp?.get('next') || '/messages/new', [sp]);

  const [phase, setPhase] = useState<Phase>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const isEmailRoughlyValid = (val: string) => {
    const e = val.trim();
    const at = e.indexOf('@');
    if (at <= 0) return false;
    const domain = e.slice(at + 1);
    return domain.includes('.');
  };

  const resend = useCallback(async () => {
    setErr(null); setMsg(null);
    const e = email.trim();
    if (!isEmailRoughlyValid(e)) { setErr('Введите корректный email'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: e }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Не удалось отправить код');
      }
      setMsg('Новый код отправлен. Проверьте почту.');
      setPhase('code');
    } catch (e: any) {
      setErr(e.message || 'Ошибка отправки кода');
    } finally {
      setLoading(false);
    }
  }, [email]);

  const requestOtp = resend;

  const verifyOtp = useCallback(async () => {
    setErr(null); setMsg(null);
    const e = email.trim();
    const token = code.replace(/[^\d]/g, '').trim();
    if (token.length < 4) { setErr('Введите код из письма'); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email: e, token, type: 'email' });
      if (error) throw error;

      const accessToken = data.session?.access_token;
      const refreshToken = data.session?.refresh_token;
      const expiresIn = data.session?.expires_in ?? 3600;
      if (!accessToken) throw new Error('Нет access token в ответе');

      const r = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: accessToken, refreshToken, expiresIn }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || 'Не удалось установить сессию');
      }

      // ВАЖНО: делаем полноценный переход, чтобы кука точно уехала на сервер
      window.location.assign(next);
    } catch (e: any) {
      setErr('Код истёк или неверен. Прислать новый и попробовать ещё раз.');
    } finally {
      setLoading(false);
    }
  }, [email, code, next]);

  return (
    <div className="wrap py-10" style={{ maxWidth: 540 }}>
      <h1 className="title mb-4">Вход</h1>
      <div className="card grid gap-4">
        {phase === 'email' && (
          <>
            <label className="text-sm">Email</label>
            <input
              className="border rounded-md px-3 py-2"
              type="email"
              placeholder="you@example.com"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
            <button className="btn" onClick={requestOtp} disabled={loading}>
              {loading ? 'Отправляю…' : 'Получить код'}
            </button>
          </>
        )}

        {phase === 'code' && (
          <>
            <div className="text-sm text-gray-600">
              Мы отправили код на <strong>{email}</strong>. Введите его ниже.
            </div>
            <input
              className="border rounded-md px-3 py-2 tracking-widest text-center"
              placeholder="КОД"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={loading}
            />
            <div className="flex gap-2">
              <button className="btn" onClick={verifyOtp} disabled={loading}>
                {loading ? 'Проверяю…' : 'Войти'}
              </button>
              <button className="btn secondary" onClick={resend} disabled={loading}>
                Прислать новый код
              </button>
            </div>
            <button
              className="btn secondary"
              onClick={() => { setPhase('email'); setCode(''); setMsg(null); setErr(null); }}
              disabled={loading}
            >
              Изменить email
            </button>
          </>
        )}

        {msg && <div className="text-sm text-green-700">{msg}</div>}
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="text-xs text-gray-500">
          Продолжая, вы соглашаетесь с Политикой конфиденциальности и Условиями использования.
        </div>
      </div>
    </div>
  );
}
