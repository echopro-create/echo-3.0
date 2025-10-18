import { Reveal } from "@/components/reveal";

export function FormatsSection() {
  return (
    <section
      className="relative w-full border-t border-black/10 py-16 md:py-20"
      role="region"
      aria-labelledby="formats-title"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" delay={60}>
          <h2
            id="formats-title"
            className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]"
          >
            Форматы посланий
          </h2>
        </Reveal>

        <Reveal as="p" delay={120}>
          <p className="mt-4 mx-auto max-w-prose text-[color:var(--muted)] md:text-lg">
            Всё, что нужно, в одном месте. Текстовые письма, голосовые и видео, файлы и вложения.
            Черновики сохраняются автоматически.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          {/* Текст */}
          <Reveal
            as="article"
            delay={160}
            className="col-span-12 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-4"
          >
            <header className="flex items-center gap-3 text-[color:var(--fg)]">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="5" width="16" height="14" rx="2" fill="currentColor" opacity="0.08" />
                <path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <h3 className="text-base font-semibold">Текст</h3>
            </header>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
              Форматированный текст без лишнего визуального мусора. Поддержка ссылок и параграфов.
            </p>
          </Reveal>

          {/* Голос */}
          <Reveal
            as="article"
            delay={200}
            className="col-span-12 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-4"
          >
            <header className="flex items-center gap-3 text-[color:var(--fg)]">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="9" y="4" width="6" height="16" rx="3" fill="currentColor" opacity="0.08" />
                <path d="M12 5v10M7 12a5 5 0 0010 0M12 17v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <h3 className="text-base font-semibold">Голос</h3>
            </header>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
              Запишите голосовое послание. Мы бережно храним оригинал без «улучшателей».
            </p>
          </Reveal>

          {/* Видео и файлы */}
          <Reveal
            as="article"
            delay={240}
            className="col-span-12 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 md:col-span-4"
          >
            <header className="flex items-center gap-3 text-[color:var(--fg)]">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h11a2 2 0 012 2v6a2 2 0 01-2 2H4z" fill="currentColor" opacity="0.08" />
                <path d="M4 7h11a2 2 0 012 2v6a2 2 0 01-2 2H4zM17 10l3-2v8l-3-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <h3 className="text-base font-semibold">Видео и файлы</h3>
            </header>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
              Передавайте видео и документы. Контроль доступа и срок хранения на вашей стороне.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
