import { Header } from "@/components/header";
import { CTA } from "@/components/cta";
import { FormatsSection } from "@/components/sections/formats";
import { DeliverySection } from "@/components/sections/delivery";
import { PrivacySection } from "@/components/sections/privacy";
import { StartSection } from "@/components/sections/start";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4">
        {/* HERO с фоновым «пульсом» */}
        <section className="relative flex min-h-[70svh] flex-col items-start justify-center gap-6 overflow-hidden py-16">
          {/* Декор: мягкие радиальные пятна и тонкая сетка, без JS */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            {/* Пятно 1 */}
            <div
              className="absolute left-1/2 top-[-6rem] h-[28rem] w-[56rem] -translate-x-1/2 rotate-[-12deg] blur-3xl
              bg-[radial-gradient(closest-side,rgba(99,102,241,0.22),transparent_70%)]
              dark:bg-[radial-gradient(closest-side,rgba(56,189,248,0.18),transparent_70%)]"
            />
            {/* Пятно 2 */}
            <div
              className="absolute right-[-10%] bottom-[-8rem] h-[24rem] w-[40rem] blur-3xl
              bg-[radial-gradient(closest-side,rgba(16,185,129,0.18),transparent_70%)]
              dark:bg-[radial-gradient(closest-side,rgba(250,204,21,0.14),transparent_70%)]"
            />
            {/* Едва заметная сетка */}
            <div className="absolute inset-0 opacity-[0.06] [background-size:32px_32px] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] text-[color:var(--fg)]" />
          </div>

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
        <DeliverySection />
        <PrivacySection />

        {/* Реальный блок «Начать», не заглушка */}
        <StartSection />
      </main>
    </>
  );
}
