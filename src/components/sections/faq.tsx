// Серверный компонент: FAQ без JS.
// Используем <details>/<summary> для доступного аккордеона,
// светлые поверхности в едином стиле со страницей.

type QA = {
  q: string;
  a: string;
};

const ITEMS: QA[] = [
  {
    q: "Что такое Echo?",
    a: "Сервис для хранения посланий в текстовом, голосовом, видеоформате или как файлы с доставкой по дате, событию или «после моей смерти». Приватность по умолчанию.",
  },
  {
    q: "Как работает доставка «после моей смерти»?",
    a: "Вы настраиваете получателей и подтверждение события. После верификации триггера мы отправляем послания и фиксируем это в журнале событий.",
  },
  {
    q: "Кто видит мои послания до отправки?",
    a: "Никто, кроме вас. Послания хранятся приватно. Вы управляете доступом и сроком хранения.",
  },
  {
    q: "Можно ли изменить условия доставки?",
    a: "Да. Дату, событие и адресатов можно редактировать до наступления триггера. Также можно отменить доставку.",
  },
  {
    q: "Какие форматы поддерживаются?",
    a: "Текст, аудио, видео и файлы. Несколько посланий можно объединять, сохранять как черновики и назначать разным получателям.",
  },
];

export function FAQSection() {
  return (
    <section
      className="relative w-full border-t border-black/10 py-16 md:py-20"
      aria-labelledby="faq-title"
      role="region"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="faq-title"
          className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]"
        >
          Частые вопросы
        </h2>

        <p className="mt-4 mx-auto max-w-prose text-[color:var(--muted)] md:text-lg">
          Коротко и по делу. Никакой пены.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {ITEMS.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10 open:shadow-md open:ring-black/10"
            >
              <summary
                className="cursor-pointer list-none select-none text-[color:var(--fg)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-semibold">{item.q}</h3>
                  <span
                    aria-hidden="true"
                    className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.04] text-[color:var(--fg)]/70 transition group-open:rotate-45"
                    title="Развернуть"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                </div>
              </summary>

              <div className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
