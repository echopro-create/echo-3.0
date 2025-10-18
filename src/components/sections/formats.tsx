import { Reveal } from "@/components/reveal";
import type { ReactNode } from "react";

type Card = {
  title: string;
  desc: string;
  icon: ReactNode;
};

const items: Card[] = [
  {
    title: "Текст",
    desc: "Письма, заметки, инструкции. Черновики и версии сохраняются.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <rect
          x="4"
          y="5"
          width="16"
          height="14"
          rx="2"
          fill="currentColor"
          opacity="0.08"
        />
        <path
          d="M7 9h10M7 13h6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Голос",
    desc: "Аудиопослания. Поддержка популярных форматов, превью прямо в браузере.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <rect
          x="5"
          y="4"
          width="4"
          height="12"
          rx="2"
          fill="currentColor"
          opacity="0.1"
        />
        <rect
          x="10"
          y="7"
          width="4"
          height="9"
          rx="2"
          fill="currentColor"
          opacity="0.1"
        />
        <rect
          x="15"
          y="10"
          width="4"
          height="6"
          rx="2"
          fill="currentColor"
          opacity="0.1"
        />
        <path
          d="M4 18h16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Видео",
    desc: "Запишите обращение. Мы бережно храним и доставляем без компромиссов.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <rect
          x="4"
          y="6"
          width="12"
          height="12"
          rx="2"
          fill="currentColor"
          opacity="0.08"
        />
        <path
          d="M16 10l4-2v8l-4-2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Файлы",
    desc: "Фото, документы и архивы. Приватный бакет, подписанные ссылки.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 4h7l5 5v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
          fill="currentColor"
          opacity="0.08"
        />
        <path
          d="M13 4v5h5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function FormatsSection() {
  return (
    <section
      className="relative w-full border-t border-black/10 py-16 md:py-20"
      aria-labelledby="formats-title"
      role="region"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" delay={60}>
          <h2
            id="formats-title"
            className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]"
          >
            Форматы
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((card, i) => (
            <Reveal
              key={card.title}
              as="article"
              delay={80 + i * 80}
              className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md hover:ring-black/10"
            >
              <header className="flex items-center gap-3 text-[color:var(--fg)]">
                <span className="text-[color:var(--fg)]">{card.icon}</span>
                <h3 className="text-base font-semibold">{card.title}</h3>
              </header>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                {card.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
