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
          Короткие отзывы о реальном опыте: без маркетинговой пены и купленных звездочек.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {ITEMS.map((t, i) => (
            <figure
              key={i}
              className="rounded-2xl border border-black/10 bg-white p-5"
            >
              <blockquote className="text-sm leading-relaxed text-[color:var(--fg)]">
                «{t.quote}»
              </blockquote>
              <figcaption className="mt-4 text-xs text-[color:var(--muted)]">
                {t.name} · {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
