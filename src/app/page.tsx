import { Header } from "@/components/header";
import { CTA } from "@/components/cta";

export default function Home() {
  return (
    <>
      <Header />
      <main
        id="main"
        className="relative mx-auto flex min-h-[100svh] max-w-6xl items-center justify-center px-4"
        role="main"
        aria-label="Главная область"
      >
        {/* Единственная сцена, светлый фон, тёмный текст */}
        <section
          className="relative w-full rounded-3xl px-0 py-24 md:py-28"
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
      </main>
    </>
  );
}
