"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function StartSection() {
  const steps = [
    { title: "Создайте послание", desc: "Текст, голос, видео или файлы. Шифрование на устройстве перед загрузкой." },
    { title: "Выберите доставку", desc: "По дате, событию или «пульсу». Настройте окно, таймаут и получателей." },
    { title: "Проверьте и запустите", desc: "Предпросмотр, журнал аудита и подтверждение запуска." },
  ];

  const reduce = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

  return (
    <section id="start" className="py-24 border-t scroll-mt-20" aria-labelledby="start-title">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h2
          id="start-title"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.35, ease }}
          className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl"
        >
          Начать
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.3, ease, delay: reduce ? 0 : 0.05 }}
          className="mb-10 max-w-2xl opacity-80 md:text-lg"
        >
          Три шага без квестов: создайте послание, выберите способ доставки, запустите.
        </motion.p>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.3, ease, delay: reduce ? 0 : i * 0.06 }}
              className="rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm"
            >
              <div className="mb-3 text-sm opacity-60" aria-hidden="true">
                Шаг {i + 1}
              </div>
              <h3 className="mb-2 text-lg font-medium">{s.title}</h3>
              <p className="text-sm opacity-80">{s.desc}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium
                       bg-[color:var(--fg)] text-[color:var(--bg)]
                       hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Создать послание (переход к входу)"
          >
            Создать послание
          </Link>
          <p className="mt-3 text-sm opacity-70">
            Войдите и начните: редактор послания, выбор доставки и журнал действий уже на месте.
          </p>
        </div>
      </div>
    </section>
  );
}
