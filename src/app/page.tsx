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
        {/* HERO — современный simple-centered по канону */}
        <section
          className="relative w-full py-20 md:py-28"
          aria-labelledby="hero-title"
          role="region"
        >
          {/* бейдж над заголовком */}
          <div className="mx-auto max-w-3xl text-left md:text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs text-[color:var(--fg)]/70 md:mx-auto">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--fg)]/70" />
              Приватность по умолчанию · Доставка по событию и времени
            </div>

            <h1
              id="hero-title"
              className="mt-5 text-4xl font-medium leading-[1.08] tracking-tight text-[color:var(--fg)] md:text-7xl"
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

            {/* trust strip */}
            <div className="mt-6 text-center text-xs text-[color:var(--muted)]">
              Без рекламы · Без трекинга · Можно удалить всё одним щелчком
            </div>
          </div>
        </section>

        {/* FEATURES — «bento grid» */}
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

            <div className="mt-10 grid gap-4 md:grid-cols-6">
              {/* 1. Создание */}
              <article className="group relative col-span-6 overflow-hidden rounded-2xl border border-black/10 bg-white p-6 md:col-span-3">
                <header className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--fg)] text-[color:var(--bg)] text-xs font-semibold">
                    1
                  </span>
                  <h3 className="text-base font-semibold text-[color:var(--fg)]">Создайте послание</h3>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)] max-w-prose">
                  Текст, голос, видео или файлы. Всё в одном месте, без лишнего цирка. Сохраняйте черновики, назначайте получателей.
                </p>
              </article>

              {/* 2. Триггер */}
              <article className="group relative col-span-6 overflow-hidden rounded-2xl border border-black/10 bg-white p-6 md:col-span-3">
                <header className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--fg)] text-[color:var(--bg)] text-xs font-semibold">
                    2
                  </span>
                  <h3 className="text-base font-semibold text-[color:var(--fg)]">Выберите триггер</h3>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)] max-w-prose">
                  Дата, событие или «после моей смерти». Настройки простые и прозрачные. Всегда можно изменить или отменить.
                </p>
              </article>

              {/* 3. Доставка — растянутый тайл */}
              <article className="group relative col-span-6 overflow-hidden rounded-2xl border border-black/10 bg-white p-6 md:col-span-4">
                <header className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--fg)] text-[color:var(--bg)] text-xs font-semibold">
                    3
                  </span>
                  <h3 className="text-base font-semibold text-[color:var(--fg)]">Мы доставим вовремя</h3>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)] max-w-prose">
                  Шифруем, бережно храним, отправляем по условиям. Уведомления о статусе доставки, журнал событий, подтверждение получения.
                </p>
              </article>

              {/* 4. Приватность — компактный тайл */}
              <article className="group relative col-span-6 overflow-hidden rounded-2xl border border-black/10 bg-white p-6 md:col-span-2">
                <header className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--fg)] text-[color:var(--bg)] text-xs font-semibold">
                    •
                  </span>
                  <h3 className="text-base font-semibold text-[color:var(--fg)]">Приватность по умолчанию</h3>
                </header>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)] max-w-prose">
                  Минимум метаданных, никаких рекламных пикселей. Вы управляете сроком хранения и доступом.
                </p>
              </article>
            </div>

            <div className="mt-8 flex justify-center">
              <CTA />
            </div>
          </div>
        </section>

        {/* TESTIMONIALS — свежая секция с реальными голосами */}
        <TestimonialsSection />
      </main>
    </>
  );
}
