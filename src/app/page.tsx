import { Header } from "@/components/header";
import { CTA } from "@/components/cta";
import { FormatsSection } from "@/components/sections/formats";
import { DeliverySection } from "@/components/sections/delivery";
import { PrivacySection } from "@/components/sections/privacy";
import { StartSection } from "@/components/sections/start";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 space-y-28 md:space-y-36">
        {/* HERO без клеток, только мягкие пятна + общая «аура» */}
        <section
          className="relative flex min-h-[80svh] flex-col items-start justify-center gap-8 overflow-hidden py-24
                     bg-[radial-gradient(80%_60%_at_50%_10%,rgba(99,102,241,0.08),transparent_60%)]
                     dark:bg-[radial-gradient(80%_60%_at_50%_10%,rgba(56,189,248,0.08),transparent_60%)]"
        >
          {/* Декор: радиальные пятна, без сетки и без тяжёлых фильтров */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            {/* Пятно 1 */}
            <div
              className="absolute left-1/2 top-[-10rem] h-[34rem] w-[68rem] -translate-x-1/2 rotate-[-10deg] blur-3xl
              bg-[radial-gradient(closest-side,rgba(99,102,241,0.28),transparent_70%)]
              dark:bg-[radial-gradient(closest-side,rgba(56,189,248,0.22),transparent_70%)]"
            />
            {/* Пятно 2 */}
            <div
              className="absolute right-[-14%] bottom-[-10rem] h-[28rem] w-[46rem] blur-3xl
              bg-[radial-gradient(closest-side,rgba(16,185,129,0.22),transparent_70%)]
              dark:bg-[radial-gradient(closest-side,rgba(250,204,21,0.18),transparent_70%)]"
            />
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
            Сообщения, которые приходят вовремя.
          </h1>

          <p className="max-w-2xl text-lg opacity-90 md:text-xl">
            Echo собирает текст, голос и видео в одно место и доставляет их по расписанию:
            по дате, событию или вашему «пульсу». Быстро, предсказуемо, без цирка.
          </p>

          <CTA />

          <p className="text-xs opacity-70">
            Можно отправить через годы, в нужный момент. Без спешки и лишнего шума.
          </p>

          {/* TRUST STRIP */}
          <div className="w-full pt-4">
            <ul className="flex flex-wrap gap-2.5 text-xs opacity-90">
              <li className="rounded-xl bg-[color:var(--fg)]/5 px-3 py-2 ring-1 ring-[color:var(--fg)]/10">
                Шифрование на устройстве
              </li>
              <li className="rounded-xl bg-[color:var(--fg)]/5 px-3 py-2 ring-1 ring-[color:var(--fg)]/10">
                RLS: доступ только владельцу
              </li>
              <li className="rounded-xl bg-[color:var(--fg)]/5 px-3 py-2 ring-1 ring-[color:var(--fg)]/10">
                Ключи отдельно от данных
              </li>
              <li className="rounded-xl bg-[color:var(--fg)]/5 px-3 py-2 ring-1 ring-[color:var(--fg)]/10">
                <Link
                  href="/security"
                  className="rounded-lg underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Архитектура безопасности
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* СЕКЦИИ */}
        <FormatsSection />
        <DeliverySection />
        <PrivacySection />
        <StartSection />
      </main>
    </>
  );
}
