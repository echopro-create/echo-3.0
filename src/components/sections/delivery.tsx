import { Reveal } from "@/components/reveal";
import Link from "next/link";

export function DeliverySection() {
  return (
    <section
      className="relative w-full border-t border-black/10 py-16 md:py-20"
      aria-labelledby="delivery-title"
      role="region"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" delay={60}>
          <h2
            id="delivery-title"
            className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]"
          >
            Доставка
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Reveal
            as="article"
            delay={100}
            className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10"
          >
            <header className="flex items-center gap-3 text-[color:var(--fg)]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  fill="currentColor"
                  opacity="0.08"
                />
                <path
                  d="M12 7v5l3 2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <h3 className="text-base font-semibold">По дате и времени</h3>
            </header>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
              Отправка в заданный момент. Можно перепланировать или отменить до
              срока.
            </p>
          </Reveal>

          <Reveal
            as="article"
            delay={160}
            className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10"
          >
            <header className="flex items-center gap-3 text-[color:var(--fg)]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M4 7h16v10H4z" fill="currentColor" opacity="0.08" />
                <path
                  d="M4 7l8 6 8-6M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <h3 className="text-base font-semibold">По событию</h3>
            </header>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
              Внешний сигнал или кодовое слово. Гибкие сценарии без шаманства.
            </p>
          </Reveal>

          <Reveal
            as="article"
            delay={220}
            className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10"
          >
            <header className="flex items-center gap-3 text-[color:var(--fg)]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="9"
                  rx="2"
                  fill="currentColor"
                  opacity="0.08"
                />
                <path
                  d="M8 10V8a4 4 0 118 0v2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <h3 className="text-base font-semibold">После моей смерти</h3>
            </header>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
              «Пульс» в аккаунте, проверка молчания и автоматическая отправка.
              Трезво и прозрачно.
            </p>
          </Reveal>
        </div>

        <Reveal as="div" delay={280}>
          <div className="mt-10 flex justify-center">
            <Link
              href="/messages/new"
              className="inline-flex items-center rounded-lg border border-black/10 bg-black px-4 py-2 text-sm text-white transition hover:bg-black/90"
            >
              Создать послание
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
