// app/s/[token]/page.tsx
import PublicShareClient from "./Client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Публичное послание — ECHO",
  description:
    "Просмотр публичного послания. Если ссылка защищена паролем или недействительна, вы увидите понятное сообщение.",
};

type Params = Promise<{ token: string }>;

export default async function Page({ params }: { params: Params }) {
  let token = "";
  try {
    const p = await params; // Next 15 отдаёт params как промис
    token = typeof p?.token === "string" ? p.token : "";
  } catch {
    token = "";
  }

  if (!token) {
    return (
      <main style={{ maxWidth: 720, margin: "48px auto", padding: "0 16px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
          Ссылка недействительна
        </h1>
        <p style={{ lineHeight: 1.6, opacity: 0.9 }}>
          Не удалось получить токен ссылки. Проверьте адрес или откройте ссылку
          из сообщения ещё раз.
        </p>
      </main>
    );
  }

  return <PublicShareClient token={token} />;
}
