import { Header } from "@/components/header";
import { CTA } from "@/components/cta";

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
        {/* Единственная сцена, светлый фон, тёмный текст */}
        <section
          className="relative w-full rounded-3xl py-24 md:py-28"
          aria-labelledby="hero-title"
          role="region"
        >
          <div className="mx-auto max-w-3xl text-left md:text-center">
            <h1
              id="hero-title"
              className="text-4xl font-medium leading-[1.1] tracking-tight text-[color:var(--fg)] md:text-7xl"
            >
              Послания, которые будут доставлены после нас.
            </h1>

            <p
              className="mt-6 mx-auto max-w-prose text-base leading-relaxed text-[color:var(--muted)] md:text-lg"
              aria-describedby="hero-title"
            >
              Echo хранит ваши текст, голос, видео или файлы и доставляет их по дате, событию или после вашей
              смерти. Мы доставим всё в нужное время.
            </p>

            {/* Центрируем CTA */}
            <div className="mt-10 flex justify-center">
              <CTA />
            </div>
          </div>
        </section>

        {/* Как это работает — современная подача без «коробок» */}
        <section
          className="relative w-full border-t border-black/10 py-16 md:py-20"
          aria-labelledby="how-title"
          role="region"
        >
          <div className="mx-auto max-w-4xl">
            <h2
              id="how-title"
              className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]"
            >
              Как это работает
            </h2>

            <p className="mt-4 mx-auto max-w-prose text-[color:var(--muted)] md:text-lg">
              Коротко и без тумана: вы создаёте послание, выбираете момент доставки, остальное — наша работа.
            </p>

            {/* Три шага: разделители вместо рамок, числовые бейджи */}
            <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6 md:divide-x md:divide-black/10">
              <li className="flex flex-col gap-3 md:px-6">
                <span
                  aria-hidden="true"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--fg)] text-[color:var(--bg)] text-sm font-semibold"
                >
                  1
                </span>
                <h3 className="text-lg font-semibold text-[color:var(--fg)]">Создайте послание</h3>
                <p className="text-sm leading-relaxed text-[color:var(--muted)]">
                  Текст, голос, видео или файлы. Всё хранится в одном месте и привязано к вам.
                </p>
              </li>

              <li className="flex flex-col gap-3 md:px-6">
                <span
                  aria-hidden="true"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--fg)] text-[color:var(--bg)] text-sm font-semibold"
                >
                  2
                </span>
                <h3 className="text-lg font-semibold text-[color:var(--fg)]">Выберите триггер</h3>
                <p className="text-sm leading-relaxed text-[color:var(--muted)]">
                  Дата, событие или «после моей смерти». Настройки простые и прозрачные.
                </p>
              </li>

              <li className="flex flex-col gap-3 md:px-6">
                <span
                  aria-hidden="true"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--fg)] text-[color:var(--bg)] text-sm font-semibold"
                >
                  3
                </span>
                <h3 className="text-lg font-semibold text-[color:var(--fg)]">Мы доставим вовремя</h3>
                <p className="text-sm leading-relaxed text-[color:var(--muted)]">
                  Шифруем, бережно храним, отправляем по условиям. Приватность по умолчанию.
                </p>
              </li>
            </ol>
          </div>
        </section>
      </main>
    </>
  );
}
