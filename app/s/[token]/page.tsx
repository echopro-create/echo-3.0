// app/s/[token]/page.tsx
import PublicShareClient from "./Client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Публичное послание — ECHO",
  description:
    "Просмотр публичного послания. Если ссылка защищена паролем или недействительна, вы увидите понятное сообщение.",
};

// В Next 15 params может быть промисом, а может отдаться сразу.
// Делаем максимально терпеливое извлечение токена, без истерик.
type ParamsMaybePromise =
  | { token: string }
  | Promise<{ token: string }>
  | undefined;

async function getToken(params: ParamsMaybePromise): Promise<string> {
  try {
    const p = typeof (params as any)?.then === "function" ? await (params as any) : (params as any);
    const t = p?.token ?? "";
    return typeof t === "string" ? t : "";
  } catch {
    return "";
  }
}

export default async function Page(props: { params?: ParamsMaybePromise }) {
  const token = await getToken(props?.params);

  if (!token) {
    // Ничего не рушим: показываем вежливый текст.
    return (
      <main style={{ maxWidth: 720, margin: "48px auto", padding: "0 16px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
          Ссылка недействительна
        </h1>
        <p style={{ lineHeight: 1.6, opacity: 0.9 }}>
          Не удалось получить токен ссылки. Проверьте адрес или откройте ссылку из
          сообщения ещё раз.
        </p>
      </main>
    );
  }

  return <PublicShareClient token={token} />;
}
