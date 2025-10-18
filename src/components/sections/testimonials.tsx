type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

const ITEMS: Testimonial[] = [
  {
    name: "Анна",
    role: "получатель",
    quote:
      "Послание пришло в день, когда оно было действительно нужно. Тихо, без спама и лишних слов.",
  },
  {
    name: "Сергей",
    role: "отправитель",
    quote:
      "Собрал видео для сына и настроил доставку на выпускной. Всё просто и прозрачно.",
  },
  {
    name: "Марина",
    role: "адвокат",
    quote:
      "Нравится, что по умолчанию всё приватно. Чёткие условия хранения и понятные журналы событий.",
  },
];

export function TestimonialsSection() {
  return (
    <section
      className="relative w-full border-t border-black/10 py-16 md:py-20"
      aria-labelledby="testimonials-title"
      role="region"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="testimonials-title"
          className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]"
        >
          Что говорят пользователи
        </h2>

        <p className="mt-4 mx-auto max-w-prose text-[color:var(--muted)] md:text-lg">
          Короткие отзывы о реальном опыте: без маркетинговой пены и купленных
          звёздочек.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {ITEMS.map((t, i) => (
            <figure
              key={i}
              className="group relative overflow-hidden rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10"
            >
              {/* декоративная «лапка» кавычек */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="absolute right-4 top-4 text-[color:var(--fg)]/10 transition group-hover:text-[color:var(--fg)]/20"
              >
                <path
                  d="M8 7c-2 0-3 1.5-3 3s1 2.5 3 2.5V17H3v-4.5C3 9 5.5 7 8 7Zm9 0c-2 0-3 1.5-3 3s1 2.5 3 2.5V17h-5v-4.5C12 9 14.5 7 17 7Z"
                  fill="currentColor"
                />
              </svg>

              <blockquote className="text-base leading-relaxed text-[color:var(--fg)]">
                «{t.quote}»
              </blockquote>

              <figcaption className="mt-5 flex items-center gap-2 text-xs text-[color:var(--muted)]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.04] text-[11px] font-medium text-[color:var(--fg)]/80">
                  {t.name.slice(0, 1)}
                </span>
                <span className="truncate">
                  {t.name}
                  <span className="px-1 text-[color:var(--fg)]/30">·</span>
                  {t.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
