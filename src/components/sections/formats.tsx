"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Mic, Video, Paperclip } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const items = [
  { icon: FileText, title: "Текст",  desc: "Заметки, письма, напоминания. Быстро и читабельно." },
  { icon: Mic,      title: "Голос",  desc: "Короткие голосовые и длинные размышления — всё в одном." },
  { icon: Video,    title: "Видео",  desc: "Когда важны лицо и интонация. Доставка без задержек." },
  { icon: Paperclip,title: "Файлы",  desc: "Приложения, сканы и всё, что должно приехать вовремя." },
];

export function FormatsSection() {
  const reduce = useReducedMotion();

  // Короткая, приличная анимация. Безье вместо строки, чтобы TS не капризничал.
  const baseTransition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

  return (
    <section id="formats" className="py-20 border-t">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
        Форматы
      </h2>
      <p className="mb-8 opacity-80">
        Текст, голос, видео и файлы. Всё в одном месте и по расписанию.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ ...baseTransition, delay: reduce ? 0 : i * 0.04 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <Card
              role="article"
              tabIndex={0}
              className="rounded-2xl ring-1 ring-[color:var(--fg)]/10 card-hover
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <CardHeader className="flex flex-row items-center gap-3">
                <span
                  className="inline-flex size-10 items-center justify-center rounded-xl
                             bg-[color:var(--fg)]/5 ring-1 ring-[color:var(--fg)]/15"
                  aria-hidden="true"
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm opacity-80">{desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
