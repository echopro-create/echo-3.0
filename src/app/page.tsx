import { Header } from "@/components/header";
import { CTA } from "@/components/cta";
import { TestimonialsSection } from "@/components/sections/testimonials";

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
        {/* HERO — акцентная типографика, мягкий фон, чистый ритм */}
        <section
          className="relative w-full py-20 md:py-28"
          aria-labelledby="hero-title"
          role="region"
        >
          {/* декоративный мягкий фон, без кислотных градиентов */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute -top-24 -left-28 h-80 w-80 rounded-full bg-[color:var(--fg)]/[0.06] blur-3xl" />
            <div className="absolute -bottom-24 -right-28 h-96 w-96 rounded-full bg-[color:var(--fg)]/[0.05] blur-3xl" />
          </div>

          <div className="mx-auto max-w-3xl text-left md:text-center">
            {/* бейдж поверх героя */}
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs text-[color:var(--fg)]/70 md:mx-auto">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--fg)]/70" />
              Приватность по умолчанию · Доставка по событию и времени
            </div>

            <h1
              id="hero-title"
              className="mt-5 text-5xl font-medium leading-[1.05] tracking-tight text-[color:var(--fg)] md:text-7xl"
            >
              Послания, которые будут доставлены&nbsp;после нас.
            </h1>

            <p
              className="mt-6 mx-auto max-w-prose text-base leading-relaxed text-[color:var(--muted)] md:text-lg"
              aria-describedby="hero-title"
            >
              Echo хранит ваш текст, голос, видео и файлы и доставляет их по дате, событию
              или «после моей смерти». Мы шифруем, бережно храним и отправляем вовремя.
            </p>

            <div className="mt-10 flex justify-center">
              <CTA />
            </div>

            <div className="mt-6 text-center text-xs text-[color:var(--muted)]">
              Без рекламы · Без трекинга · Можно удалить всё одним щелчком
            </div>
          </div>
        </section>

        {/* FEATURES — bento без «рамок XP», мягкие поверхности, ясные иконки */}
        <section
          className="relative w-full border-t border-black/10 py-16 md:py-20"
          aria-labelledby="features-title"
          role="region"
        >
          <div className="mx-auto max-w-5xl">
            <h2
              id="features-title"
              className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]"
            >
              Как это работает
            </h2>

            <p className="mt-4 mx-auto max-w-prose text-[color:var(--muted)] md:text-lg">
              Не магия, а нормальная инженерия. Вы создаёте послание, выбираете триггер, остальное — наша работа.
            </p>

            {/* bento: мягкие карточки с тенью и лёгким ring; деликатные hover-состояния */}
            <div className="mt-10 grid gap-4 md:grid-cols-6">
              {/* 1. Создание */}
              <article className="group relative col-span-6 overflow-hidden rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-3">
                <header className="flex items-center gap-3">
                  {/* иконка-перо */}
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="text-[color:var(--fg)]">
                    <path d="M4 20c5-1 9-5 13-9l3-3-1-1-3 3c-4 4-8 8-12 9z" fill="currentColor" opacity="0.12" />
                    <path d="M4 20c5-1 9-5 13-9l3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <h3 className="text-base font-semibold text-[color:var(--fg)]">Создайте послание</h3>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)] max-w-prose">
                  Текст, голос, видео или файлы. Всё в одном месте, без лишнего цирка. Сохраняйте черновики, назначайте получателей.
                </p>
              </article>

              {/* 2. Триггер */}
              <article className="group relative col-span-6 overflow-hidden rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-3">
                <header className="flex items-center gap-3">
                  {/* иконка-часики */}
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="text-[color:var(--fg)]">
                    <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.08" />
                    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <h3 className="text-base font-semibold text-[color:var(--fg)]">Выберите триггер</h3>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)] max-w-prose">
                  Дата, событие или «после моей смерти». Настройки простые и прозрачные. Всегда можно изменить или отменить.
                </p>
              </article>

              {/* 3. Доставка — растянутый тайл */}
              <article className="group relative col-span-6 overflow-hidden rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-4">
                <header className="flex items-center gap-3">
                  {/* иконка-конверт */}
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="text-[color:var(--fg)]">
                    <path d="M4 7h16v10H4z" fill="currentColor" opacity="0.08" />
                    <path d="M4 7l8 6 8-6M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <h3 className="text-base font-semibold text-[color:var(--fg)]">Мы доставим вовремя</h3>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)] max-w-prose">
                  Шифруем, бережно храним, отправляем по условиям. Уведомления о статусе доставки, журнал событий, подтверждение получения.
                </p>
              </article>

              {/* 4. Приватность — компактный тайл */}
              <article className="group relative col-span-6 overflow-hidden rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-2">
                <header className="flex items-center gap-3">
                  {/* иконка-замок */}
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="text-[color:var(--fg)]">
                    <rect x="5" y="10" width="14" height="9" rx="2" fill="currentColor" opacity="0.08" />
                    <path d="M8 10V8a4 4 0 118 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <h3 className="text-base font-semibold text-[color:var(--fg)]">Приватность по умолчанию</h3>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)] max-w-prose">
                  Минимум метаданных, никаких рекламных пикселей. Вы управляете сроком хранения и доступом.
                </p>
              </article>
            </div>

            <div className="mt-10 flex justify-center">
              <CTA />
            </div>
          </div>
        </section>

        {/* TESTIMONIALS — оставляем ниже для доверия */}
        <TestimonialsSection />
      </main>
    </>
  );
}
