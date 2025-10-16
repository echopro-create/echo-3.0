"use client";

import { motion } from "framer-motion";
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
  return (
    <section id="delivery" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.35 }}
          className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl"
        >
          Доставка
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.35, delay: 0.05 }}
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
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="rounded-2xl border border-[var(--ring,theme(colors.slate.200))] bg-[var(--card,theme(colors.white))] p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <it.icon className="size-6 shrink-0" />
                <h3 className="text-xl font-medium">{it.title}</h3>
              </div>

              <p className="mb-3 text-sm opacity-80">{it.desc}</p>
              <p className="text-xs opacity-60">{it.hint}</p>

              <div className="mt-5 h-px w-full bg-[var(--ring,theme(colors.slate.200))]" />

              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm opacity-80">
                {it.bullets.map(b => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
