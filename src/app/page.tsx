import { Header } from "@/components/header";
import { CTA } from "@/components/cta";
import { FormatsSection } from "@/components/sections/formats";
import { DeliverySection } from "@/components/sections/delivery";
import { PrivacySection } from "@/components/sections/privacy";
import { StartSection } from "@/components/sections/start";
import Link from "next/link";
import type { Route } from "next";
import { Lock, ShieldCheck, KeyRound, Shield } from "lucide-react";

export default function Home() {
  return (
    <>
      <Header />

      {/* Обычный документный скролл, без snap и без JS */}
      <main className="mx-auto max-w-6xl px-4 space-y-28 md:space-y-36">
        {/* ================= HERO ================= */}
        <section
          className="relative flex min-h-[80svh] flex-col items-start justify-center gap-8 overflow-hidden pt-14 md:pt-20
                     bg-[radial-gradient(80%_60%_at_50%_10%,rgba(99,102,241,0.08),transparent_60%)]
                     dark:bg-[radial-gradient(80%_60%_at_50%_10%,rgba(56,189,248,0.08),transparent_60%)]"
        >
          {/* Декор */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div
              className="absolute left-1/2 top-[-10rem] h-[34rem] w-[68rem] -translate-x-1/2 rotate-[-10deg] blur-3xl
              bg-[radial-gradient(closest-side,rgba(99,102,241,0.28),transparent_70%)]
              dark:bg-[radial-gradient(closest-side,rgba(56,189,248,0.22),transparent_70%)]"
            />
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
          <div className="w-full pt-2">
            <ul className="flex flex-wrap items-baseline gap-2.5 text-xs opacity-90">
              <li className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--fg)]/5 px-3 py-2 ring-1 ring-[color:var(--fg)]/10">
                <span className="inline-flex size-5 items-center justify-center rounded-md bg-[color:var(--fg)]/5 ring-1 ring-[color:var(--fg)]/15" aria-hidden="true">
                  <Lock className="size-3" aria-hidden="true" />
                </span>
                <span>Шифрование на устройстве</span>
              </li>
              <li className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--fg)]/5 px-3 py-2 ring-1 ring-[color:var(--fg)]/10">
                <span className="inline-flex size-5 items-center justify-center rounded-md bg-[color:var(--fg)]/5 ring-1 ring-[color:var(--fg)]/15" aria-hidden="true">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                </span>
                <span>RLS: доступ только владельцу</span>
              </li>
              <li className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--fg)]/5 px-3 py-2 ring-1 ring-[color:var(--fg)]/10">
                <span className="inline-flex size-5 items-center justify-center rounded-md bg-[color:var(--fg)]/5 ring-1 ring-[color:var(--fg)]/15" aria-hidden="true">
                  <KeyRound className="size-3" aria-hidden="true" />
                </span>
                <span>Ключи отдельно от данных</span>
              </li>
              <li className="inline-flex items-center gap-2 rounded-xl px-0 py-0">
                <Link
                  href={"/security" as Route}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ring-[color:var(--fg)]/15 hover:bg-[color:var(--fg)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="inline-flex size-5 items-center justify-center rounded-md bg-[color:var(--fg)]/5 ring-1 ring-[color:var(--fg)]/15" aria-hidden="true">
                    <Shield className="size-3" aria-hidden="true" />
                  </span>
                  <span className="underline underline-offset-4">Архитектура безопасности</span>
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* ================= Formats ================= */}
        <section id="formats" className="rounded-3xl bg-[color:var(--fg)]/3 p-6 md:p-8">
          <div className="mx-auto w-full max-w-6xl">
            <FormatsSection />
          </div>
        </section>

        {/* ================= Delivery ================= */}
        <section id="delivery" className="rounded-3xl bg-transparent aura-soft p-6 md:p-8">
          <DeliverySection />
        </section>

        {/* ================= Privacy ================= */}
        <section id="privacy" className="rounded-3xl bg-[color:var(--fg)]/3 p-6 md:p-8">
          <PrivacySection />
        </section>

        {/* ================= Start ================= */}
        <section id="start" className="rounded-3xl bg-[color:var(--fg)]/6 p-6 md:p-8">
          <StartSection />
        </section>
      </main>
    </>
  );
}
