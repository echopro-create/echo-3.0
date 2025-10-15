import { Header } from "@/components/header";
import { CTA } from "@/components/cta";
import { FormatsSection } from "@/components/sections/formats";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4">
        {/* HERO */}
        <section className="flex min-h-[70svh] flex-col items-start justify-center gap-6 py-16">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            Сообщения, которые приходят вовремя.
          </h1>
          <p className="max-w-2xl text-base opacity-80 md:text-lg">
            Echo собирает текст, голос и видео в одно место и доставляет их по расписанию:
            по дате, событию или вашему «пульсу». Быстро, предсказуемо, без цирка.
          </p>
          <CTA />
        </section>

        {/* СЕКЦИИ */}
        <FormatsSection />

        <section id="delivery" className="py-20 border-t">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Доставка</h2>
          <p className="opacity-80">
            По дате, событию и вашему «пульсу». Добавим схему-пояснение на следующем шаге.
          </p>
        </section>

        <section id="privacy" className="py-20 border-t">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Приватность</h2>
          <p className="opacity-80">
            Локальное шифрование, облачное хранение, RLS и аудит. Раскроем детали позже.
          </p>
        </section>

        <section id="start" className="py-24 border-t">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Начать</h2>
          <p className="opacity-80">
            Здесь будет CTA и шаги запуска. Сейчас это заглушка, чтобы навигация не вела в пустоту.
          </p>
        </section>
      </main>
    </>
  );
}
