// src/app/page.tsx
export const dynamic = "force-static";      // генерим статикой на билде
export const revalidate = 60 * 60 * 24;     // ISR: переcборка раз в сутки

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">ECHO 3.0</h1>
      <p className="text-base opacity-80">
        Стартовая страница на месте. Next.js 15 + TypeScript + Tailwind.
      </p>
      <p className="text-sm opacity-60">
        Если ты видишь это на домене — значит прод ожил и 404 ушла в отпуск.
      </p>
    </main>
  );
}
