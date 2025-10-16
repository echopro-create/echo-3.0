"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Database, FileSearch2 } from "lucide-react";

type Item = {
  icon: React.ElementType;
  title: string;
  desc: string;
};

const items: Item[] = [
  {
    icon: Lock,
    title: "Локальное шифрование",
    desc: "Контент шифруется на устройстве перед отправкой. Сервер видит только зашифрованные данные.",
  },
  {
    icon: Database,
    title: "Хранение в облаке",
    desc: "Надёжные бакеты с версионированием и сроками жизни. Ключи доступа изолированы.",
  },
  {
    icon: ShieldCheck,
    title: "RLS-политики",
    desc: "Правила на уровне строк: доступ строго по владельцу и связям. Никаких «общих» таблиц.",
  },
  {
    icon: FileSearch2,
    title: "Аудит и журнал",
    desc: "Подпись действий и событий. Прозрачность: кто, когда и что запросил.",
  },
];

export function PrivacySection() {
  return (
    <section id="privacy" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.35 }}
          className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl"
        >
          Приватность
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-10 max-w-2xl opacity-80 md:text-lg"
        >
          Минимум доверия, максимум контроля. Мы проектируем систему так, чтобы даже при любопытном сервере твои данные были бесполезны.
        </motion.p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <motion.article
              key={it.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-2xl border border-[var(--ring,theme(colors.slate.200))] bg-[var(--card,theme(colors.white))] p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <it.icon className="size-6 shrink-0" />
                <h3 className="text-base font-medium">{it.title}</h3>
              </div>
              <p className="text-sm opacity-80">{it.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
