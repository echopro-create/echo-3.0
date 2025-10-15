"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Mic, Video, Paperclip } from "lucide-react";

const items = [
  { icon: FileText, title: "Текст",  desc: "Заметки, письма, напоминания. Быстро и читабельно." },
  { icon: Mic,      title: "Голос",  desc: "Короткие голосовые и длинные размышления — всё в одном." },
  { icon: Video,    title: "Видео",  desc: "Когда важны лицо и интонация. Доставка без задержек." },
  { icon: Paperclip,title: "Файлы",  desc: "Приложения, сканы и всё, что должно приехать вовремя." },
];

export function FormatsSection() {
  return (
    <section id="formats" className="py-20 border-t">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight">Форматы</h2>
      <p className="mb-8 opacity-80">Текст, голос, видео и файлы. Всё в одном месте и по расписанию.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl ring-1 ring-[color:var(--fg)]/15">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm opacity-80">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
