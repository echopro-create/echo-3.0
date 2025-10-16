"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarClock, Zap, HeartPulse } from "lucide-react";

type Item = {
  icon: React.ElementType;
  title: string;
  desc: string;
  hint: string;
  bullets: string[];
};

const items: Item[] = [
  {
    icon: CalendarClock,
    title: "По дате",
    desc: "Фиксированная дата и время с учётом часового пояса. Никаких напоминаний и ручных запусков.",
    hint: "Пример: 12.12.2030, 09:00",
    bullets: ["ISO-время, защита от задвоений", "Проверка окна доставки"],
  },
  {
    icon: Zap,
    title: "По событию",
    desc: "Запуск по внешнему триггеру: токен-ссылка, webhook, кодовое слово.",
    hint: "Пример: подтверждение юристом",
    bullets: ["Подписанные запросы, анти-replay", "Журнал аудита"],
  },
  {
    icon: HeartPulse,
    title: "По «пульсу»",
    desc: "Dead-man-switch: если не отмечаешься в срок — послание уходит получателям.",
    hint: "Пример: отметка раз в 30 дней",
    bullets: ["Гибкий интервал «я в порядке»", "Мягкая задержка и отложенная отправка"],
  },
];

export function DeliverySection() {
  const reduce = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

  return (
    <section id="delivery" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.35, ease }}
          className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl"
        >
          Доставка
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.35, ease, delay: reduce ? 0 : 0.05 }}
          className="mb-10 max-w-2xl opacity-80 md:text-lg"
        >
          Три режима, один результат: послание приходит вовремя и только тем, кому нужно.
        </motion.p>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <motion.article
              key={it.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.3, ease, delay: reduce ? 0 : i * 0.06 }}
              className="rounded-2xl bg-[var(--card,theme(colors.white))] p-5 ring-1 ring-[color:var(--fg)]/10 card-hover
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              tabIndex={0}
              role="article"
              aria-label={it.title}
            >
              <div className="mb-4 flex items-center gap-3">
                {/* Иконки декоративные, не читаем экраном */}
                <span
                  className="inline-flex size-10 items-center justify-center rounded-xl
                             bg-[color:var(--fg)]/5 ring-1 ring-[color:var(--fg)]/15"
                  aria-hidden="true"
                >
                  <it.icon className="size-5 shrink-0" aria-hidden="true" focusable="false" />
                </span>
                <h3 className="text-xl font-medium">{it.title}</h3>
              </div>

              <p className="mb-3 text-sm opacity-80">{it.desc}</p>

              <div className="mb-3 inline-flex items-center gap-2 text-xs opacity-70">
                <span className="rounded-lg bg-[color:var(--fg)]/5 px-2 py-1 ring-1 ring-[color:var(--fg)]/10">
                  {it.hint}
                </span>
              </div>

              <div className="mt-3 h-px w-full bg-[var(--ring,theme(colors.slate.200))]" />

              <ul className="mt-4 space-y-1.5 text-sm opacity-80">
                {it.bullets.map((b) => (
                  <li key={b} className="pl-5 [text-wrap:balance]">
                    <span className="mr-2 inline-block size-1.5 translate-y-[-2px] rounded-full bg-[color:var(--fg)]/40" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
