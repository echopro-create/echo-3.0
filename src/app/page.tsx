import { Header } from "@/components/header";
import { CTA } from "@/components/cta";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { FAQSection } from "@/components/sections/faq";
import { Reveal } from "@/components/reveal";

export default function Home() {
  return (
    <>
      <Header />
      <main
        id="main"
        className="relative mx-auto max-w-6xl px-4"
        role="main"
        aria-label="Главная область"
      >
        {/* HERO — web 3.0: variable font + орбиты + мягкий параллакс без JS */}
        <section
          className="relative w-full py-24 md:py-36"
          aria-labelledby="hero-title"
          role="region"
        >
          {/* Декоративный слой: орбиты и сетка точек. Никаких радуг. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            {/* Сетка точек */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "radial-gradient(currentColor 1px, transparent 1px)",
                backgroundSize: "18px 18px",
                color: "var(--fg)",
                maskImage:
                  "linear-gradient(to bottom, black, black, transparent)",
              }}
            />
            {/* Большая орбита */}
            <div
              className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.06]"
              style={{
                background:
                  "conic-gradient(from 0deg at 50% 50%, currentColor, transparent 35%, transparent 65%, currentColor)",
                filter: "blur(18px)",
                color: "var(--fg)",
                animation:
                  "spin-slow 24s linear infinite",
              }}
            />
            {/* Внутренняя орбита */}
            <div
              className="absolute left-1/2 top-1/2 h-[44vmin] w-[44vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.08]"
              style={{
                background:
                  "radial-gradient(closest-side, currentColor 0.5px, transparent 40%)",
                color: "var(--fg)",
                animation:
                  "pulse-soft 8s ease-in-out infinite",
                filter: "blur(6px)",
              }}
            />
            {/* Параллакс-вспышки */}
            <div className="absolute -top-28 -left-24 h-72 w-72 translate-y-[var(--parallax-y,0px)] rounded-full bg-[color:var(--fg)]/[0.06] blur-3xl will-change-transform" />
            <div className="absolute -bottom-28 -right-24 h-96 w-96 translate-y-[calc(var(--parallax-y,0px)*-1)] rounded-full bg-[color:var(--fg)]/[0.05] blur-3xl will-change-transform" />
          </div>

          {/* Контейнер HERO */}
          <div
            className="mx-auto max-w-3xl text-left md:text-center"
            /* CSS-переменная для параллакса (прогрессивное улучшение) */
            style={{ ["--parallax-y" as any]: "0px" }}
          >
            <Reveal as="div" delay={60}>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs text-[color:var(--fg)]/70 md:mx-auto">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--fg)]/70" />
                Приватность по умолчанию · Доставка по событию и времени
              </div>
            </Reveal>

            {/* Заголовок с variable-font эффектом ширины и веса */}
            <Reveal as="h1" delay={120}>
              <h1
                id="hero-title"
                className="mt-6 text-[clamp(40px,7vw,76px)] leading-[1.02] tracking-tight text-[color:var(--fg)]"
                style={{
                  // Манропа/Попис — variable. Управляем осями плавно.
                  fontVariationSettings: "'wght' 650, 'wdth' 92",
                }}
              >
                Послания, которые будут доставлены&nbsp;
                <span
                  className="inline-block"
                  style={{
                    fontVariationSettings: "'wght' 720, 'wdth' 85",
                    letterSpacing: "-0.01em",
                  }}
                >
                  после нас
                </span>
                .
              </h1>
            </Reveal>

            <Reveal as="p" delay={180}>
              <p
                className="mt-6 mx-auto max-w-prose text-base leading-relaxed text-[color:var(--muted)] md:text-lg"
                aria-describedby="hero-title"
              >
                Echo хранит текст, голос, видео и файлы и доставляет их по дате, событию
                или «после моей смерти». Мы шифруем, бережно храним и отправляем вовремя.
              </p>
            </Reveal>

            <Reveal as="div" delay={240}>
              <div className="mt-10 flex justify-center">
                <CTA />
              </div>
            </Reveal>

            <Reveal as="div" delay={280}>
              <div className="mt-6 text-center text-xs text-[color:var(--muted)]">
                Без рекламы · Без трекинга · Можно удалить всё одним щелчком
              </div>
            </Reveal>
          </div>

          {/* Встроенные ключевые кадры и предпочтения по анимациям */}
          <style>{`
            @keyframes spin-slow { to { transform: rotate(360deg); } }
            @keyframes pulse-soft {
              0%,100% { transform: scale(0.98); opacity: .06; }
              50% { transform: scale(1.02); opacity: .10; }
            }
            @media (prefers-reduced-motion: reduce) {
              [aria-labelledby="hero-title"] div[aria-hidden="true"] * { animation: none !important; }
            }
          `}</style>

          {/* Небольшой прогрессивный параллакс без фреймворков (отключается при reduce) */}
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `
              try{
                const sec=document.currentScript?.parentElement;
                const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if(sec && !prefersReduced){
                  const cont=sec.querySelector('[style*="--parallax-y"]');
                  const onScroll=()=>{
                    const r=sec.getBoundingClientRect();
                    const y=Math.max(-40, Math.min(40, (window.innerHeight/2 - (r.top + r.height/2))*0.06));
                    if(cont) cont.style.setProperty('--parallax-y', y.toFixed(2)+'px');
                  };
                  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
                }
              }catch(e){}
            `,
            }}
          />
        </section>

        {/* FEATURE STRIP — 3 ключевых тезиса, скролл-каскад */}
        <section
          className="relative w-full border-t border-black/10 py-12 md:py-16"
          aria-labelledby="highlights-title"
          role="region"
        >
          <h2 id="highlights-title" className="sr-only">
            Преимущества
          </h2>
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              {
                title: "Текст, голос, видео, файлы",
                desc: "Все форматы в одном месте. Черновики, получатели, статусы.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="4" y="5" width="16" height="14" rx="2" fill="currentColor" opacity="0.08" />
                    <path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                title: "Доставка по событию и времени",
                desc: "Дата, событие или «после моей смерти». Изменяйте в любой момент.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.08" />
                    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                title: "Приватность по умолчанию",
                desc: "Минимум метаданных, шифрование, управление доступом.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="5" y="10" width="14" height="9" rx="2" fill="currentColor" opacity="0.08" />
                    <path d="M8 10V8a4 4 0 118 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <Reveal
                key={i}
                as="article"
                delay={80 + i * 80}
                className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10"
              >
                <header className="flex items-center gap-3 text-[color:var(--fg)]">
                  <span className="text-[color:var(--fg)]">{item.icon}</span>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* HOW (Bento) — белые поверхности, reveal по колонкам */}
        <section
          className="relative w-full border-t border-black/10 py-16 md:py-20"
          aria-labelledby="features-title"
          role="region"
        >
          <div className="mx-auto max-w-5xl">
            <Reveal as="h2" delay={60}>
              <h2
                id="features-title"
                className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]"
              >
                Как это работает
              </h2>
            </Reveal>

            <Reveal as="p" delay={120}>
              <p className="mt-4 mx-auto max-w-prose text-[color:var(--muted)] md:text-lg">
                Не магия, а нормальная инженерия. Вы создаёте послание, выбираете триггер, остальное — наша работа.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-6">
              <Reveal
                as="article"
                delay={160}
                className="relative col-span-6 overflow-hidden rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-3"
              >
                <header className="flex items-center gap-3 text-[color:var(--fg)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 20c5-1 9-5 13-9l3-3-1-1-3 3c-4 4-8 8-12 9z" fill="currentColor" opacity="0.12" />
                    <path d="M4 20c5-1 9-5 13-9l3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <h3 className="text-base font-semibold">Создайте послание</h3>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                  Текст, голос, видео или файлы. Всё в одном месте. Черновики, получатели, статусы.
                </p>
              </Reveal>

              <Reveal
                as="article"
                delay={220}
                className="relative col-span-6 overflow-hidden rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-3"
              >
                <header className="flex items-center gap-3 text-[color:var(--fg)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.08" />
                    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <h3 className="text-base font-semibold">Выберите триггер</h3>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                  Дата, событие или «после моей смерти». Всегда можно изменить или отменить.
                </p>
              </Reveal>

              <Reveal
                as="article"
                delay={280}
                className="relative col-span-6 overflow-hidden rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-4"
              >
                <header className="flex items-center gap-3 text-[color:var(--fg)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 7h16v10H4z" fill="currentColor" opacity="0.08" />
                    <path d="M4 7l8 6 8-6M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <h3 className="text-base font-semibold">Мы доставим вовремя</h3>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                  Шифруем, бережно храним, отправляем по условиям. Уведомления и журнал событий.
                </p>
              </Reveal>

              <Reveal
                as="article"
                delay={320}
                className="relative col-span-6 overflow-hidden rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-2"
              >
                <header className="flex items-center gap-3 text-[color:var(--fg)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="5" y="10" width="14" height="9" rx="2" fill="currentColor" opacity="0.08" />
                    <path d="M8 10В8a4 4 0 118 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <h3 className="text-base font-semibold">Приватность по умолчанию</h3>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                  Минимум метаданных. Вы контролируете срок хранения и доступ.
                </p>
              </Reveal>
            </div>

            <Reveal as="div" delay={360}>
              <div className="mt-10 flex justify-center">
                <CTA />
              </div>
            </Reveal>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <Reveal as="div" delay={60}>
          <TestimonialsSection />
        </Reveal>

        {/* FAQ */}
        <Reveal as="div" delay={60}>
          <FAQSection />
        </Reveal>

        {/* Заключительный CTA */}
        <section className="relative w-full border-t border-black/10 py-16 md:py-20" role="region" aria-labelledby="cta-end">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal as="h2" delay={60}>
              <h2 id="cta-end" className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
                Готовы подготовить послание
              </h2>
            </Reveal>
            <Reveal as="p" delay={120}>
              <p className="mt-4 mx-auto max-w-prose text-[color:var(--muted)] md:text-lg">
                Начните с одного письма. Остальное приложится.
              </p>
            </Reveal>
            <Reveal as="div" delay={180}>
              <div className="mt-8 flex justify-center">
                <CTA />
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
