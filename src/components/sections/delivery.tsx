import { Reveal } from "@/components/reveal";
import { CTA } from "@/components/cta";

export function DeliverySection() {
  return (
    <section
      className="relative w-full border-t border-black/10 py-16 md:py-20"
      role="region"
      aria-labelledby="delivery-title"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" delay={60}>
          <h2
            id="delivery-title"
            className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]"
          >
            Доставка посланий
          </h2>
        </Reveal>

        <Reveal as="p" delay={120}>
          <p className="mt-4 mx-auto max-w-prose text-[color:var(--muted)] md:text-lg">
            Вы выбираете условие. Мы доставляем вовремя. Всегда можно изменить или отменить.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          {/* По дате/времени */}
          <Reveal
            as="article"
            delay={160}
            className="col-span-12 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-4"
          >
            <header className="flex items-center gap-3 text-[color:var(--fg)]">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.08" />
                <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <h3 className="text-base font-semibold">По времени</h3>
            </header>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
              Конкретная дата и час. Часовой пояс учитывается, получатели не теряются.
            </p>
          </Reveal>

          {/* По событию */}
          <Reveal
            as="article"
            delay={200}
            className="col-span-12 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-4"
          >
            <header className="flex items-center gap-3 text-[color:var(--fg)]">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.06" />
              </svg>
              <h3 className="text-base font-semibold">По событию</h3>
            </header>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
              Нужен сигнал: подтверждение, кодовое слово, внешний триггер. Гибкая логика.
            </p>
          </Reveal>

          {/* «После моей смерти» */}
          <Reveal
            as="article"
            delay={240}
            className="col-span-12 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-4"
          >
            <header className="flex items-center gap-3 text-[color:var(--fg)]">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 19h12M8 11a4 4 0 118 0v3a4 4 0 11-8 0v-3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <rect x="4" y="6" width="16" height="12" rx="3" fill="currentColor" opacity="0.06" />
              </svg>
              <h3 className="text-base font-semibold">После моей смерти</h3>
            </header>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
              Отложенная доставка с проверками и периодическим «пульсом». Устойчиво к сбоям.
            </p>
          </Reveal>
        </div>

        <Reveal as="div" delay={300}>
          <div className="mt-10 flex justify-center">
            <CTA />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
