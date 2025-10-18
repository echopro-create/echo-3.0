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
              className="text-4xl font-medium leading-[1.15] tracking-[0.01em] text-[color:var(--fg)] md:text-6xl"
            >
              Послания, которые будут доставлены после нас.
            </h1>

            <p
              className="mt-6 text-base leading-relaxed text-[color:var(--muted)] md:text-lg"
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

        {/* Как это работает */}
        <section
          className="relative w-full border-t border-black/10 py-16 md:py-20"
          aria-labelledby="how-title"
          role="region"
        >
          <div className="mx-auto max-w-3xl">
            <h2 id="how-title" className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
              Как это работает
            </h2>

            <p className="mt-4 text-[color:var(--muted)] md:text-lg">
              Коротко и без тумана: вы создаёте послание, выбираете момент доставки, остальное — наша работа.
            </p>

            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              <li className="rounded-2xl border border-black/10 p-5">
                <div className="text-sm font-medium text-[color:var(--fg)] opacity-70">Шаг 1</div>
                <h3 className="mt-1 text-lg font-semibold">Создайте послание</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  Текст, голос, видео или файлы. Всё хранится в одном месте и привязано к вам.
                </p>
              </li>
              <li className="rounded-2xl border border-black/10 p-5">
                <div className="text-sm font-medium text-[color:var(--fg)] opacity-70">Шаг 2</div>
                <h3 className="mt-1 text-lg font-semibold">Выберите триггер</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  Дата, событие или «после моей смерти». Настройки простые и прозрачные.
                </p>
              </li>
              <li className="rounded-2xl border border-black/10 p-5">
                <div className="text-sm font-medium text-[color:var(--fg)] opacity-70">Шаг 3</div>
                <h3 className="mt-1 text-lg font-semibold">Мы доставим вовремя</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
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
