"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; // shadcn/ui

export function StartSection() {
  const steps = [
    { title: "Создайте послание", desc: "Текст, голос, видео или файлы. Шифрование на устройстве перед загрузкой." },
    { title: "Выберите доставку", desc: "По дате, событию или «пульсу». Настройте окно, таймаут и получателей." },
    { title: "Проверьте и запустите", desc: "Предпросмотр, журнал аудита и подтверждение запуска." },
  ];

  return (
    <section id="start" className="py-24 border-t">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.35 }}
          className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl"
        >
          Начать
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.3, delay: 0.05 }}
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
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-5 shadow-sm"
            >
              <div className="mb-3 text-sm opacity-60">Шаг {i + 1}</div>
              <h3 className="mb-2 text-lg font-medium">{s.title}</h3>
              <p className="text-sm opacity-80">{s.desc}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-10">
          <Button asChild>
            <a href="/login">Создать послание</a>
          </Button>
          <p className="mt-3 text-sm opacity-70">
            Авторизация появится после подключения Supabase Auth. Сейчас это техническая ссылка.
          </p>
        </div>
      </div>
    </section>
  );
}
