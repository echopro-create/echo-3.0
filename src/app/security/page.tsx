import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Архитектура безопасности — Echo",
  description:
    "Коротко о том, как Echo проектирует приватность: шифрование на устройстве, разделение ключей и данных, строгие RLS-политики.",
  openGraph: {
    title: "Архитектура безопасности — Echo",
    description:
      "Шифрование на устройстве, RLS по строкам, раздельное хранение ключей и данных, аудит действий.",
    url: "/security",
    siteName: "Echo",
    type: "article",
  },
  robots: { index: true, follow: true },
};

export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-10">
      <header className="space-y-3">
        <p className="text-sm opacity-60">
          <Link
            href="/"
            className="underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg"
          >
            На главную
          </Link>
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Архитектура безопасности
        </h1>
        <p className="opacity-80 md:text-lg">
          Короткий обзор принципов безопасности Echo. Без маркетингового сахарка,
          только то, что влияет на приватность и надёжность.
        </p>

        {/* Навигация по странице */}
        <nav aria-label="Навигация по разделам" className="mt-4">
          <ul className="flex flex-wrap gap-2 text-sm opacity-80">
            {[
              ["#crypto", "Шифрование"],
              ["#storage", "Хранение"],
              ["#rls", "Доступ (RLS)"],
              ["#audit", "Аудит"],
              ["#delivery", "Доставка"],
              ["#rights", "Права и доступ"],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="inline-flex rounded-lg px-3 py-1 ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* «Диаграмма словами» */}
        <div className="mt-4 rounded-2xl border border-[var(--ring)] bg-[var(--card)] p-4 text-sm opacity-90">
          <p>
            <strong>Клиент</strong> шифрует данные ключом пользователя →{" "}
            <strong>Сервер</strong> хранит зашифрованный контент без ключей →{" "}
            <strong>БД</strong> ограничивает доступ к строкам по RLS →
            <strong> Аудит</strong> фиксирует критичные операции.
          </p>
        </div>
      </header>

      {/* Шифрование */}
      <section id="crypto" className="scroll-mt-20 space-y-4">
        <h2 className="text-xl font-medium tracking-tight">Шифрование</h2>
        <ul className="list-disc space-y-2 pl-5 opacity-90">
          <li>
            <strong>На устройстве.</strong> Контент шифруется до загрузки. Сервер видит только шифртекст.
          </li>
          <li>
            <strong>Разделение ключей.</strong> Ключевой материал не хранится рядом с данными; метаданные минимальны.
          </li>
          <li>
            <strong>Обновление ключей.</strong> Ротация без утраты доступа к историческим сообщениям (через повторное шифрование или ключевые обёртки).
          </li>
        </ul>
      </section>

      {/* Хранение */}
      <section id="storage" className="scroll-mt-20 space-y-4">
        <h2 className="text-xl font-medium tracking-tight">Хранение</h2>
        <ul className="list-disc space-y-2 pl-5 opacity-90">
          <li>
            <strong>Бакеты с версионированием.</strong> Контент неизменяем, удаление мягкое до финальной очистки.
          </li>
          <li>
            <strong>Политики жизненного цикла.</strong> Сроки хранения вложений и логов определены явно.
          </li>
          <li>
            <strong>Изоляция доступов.</strong> Серверные ключи от бакетов не дают доступ к расшифровке содержимого.
          </li>
        </ul>
      </section>

      {/* Доступ (RLS) */}
      <section id="rls" className="scroll-mt-20 space-y-4">
        <h2 className="text-xl font-medium tracking-tight">Доступ (RLS)</h2>
        <ul className="list-disc space-y-2 pl-5 opacity-90">
          <li>
            <strong>Политики на уровне строк.</strong> Каждая запись принадлежит владельцу; гостевого «просмотра таблиц» нет.
          </li>
          <li>
            <strong>Минимизация селектов.</strong> Запросы возвращают только необходимые поля.
          </li>
          <li>
            <strong>Разделение обязанностей.</strong> Права на запись, доставку и чтение разведены по ролям.
          </li>
        </ul>
      </section>

      {/* Аудит */}
      <section id="audit" className="scroll-mt-20 space-y-4">
        <h2 className="text-xl font-medium tracking-tight">Аудит</h2>
        <ul className="list-disc space-y-2 pl-5 opacity-90">
          <li>
            <strong>Подпись событий.</strong> Ключевые действия фиксируются с отметкой времени и идентификатором субъекта.
          </li>
          <li>
            <strong>Защита от повторов.</strong> Для триггеров доставки используются nonce и окна допустимости.
          </li>
          <li>
            <strong>Наблюдаемость.</strong> Совмещаем технический лог и пользовательский журнал действий.
          </li>
        </ul>
      </section>

      {/* Доставка */}
      <section id="delivery" className="scroll-mt-20 space-y-4">
        <h2 className="text-xl font-medium tracking-tight">Доставка</h2>
        <ul className="list-disc space-y-2 pl-5 opacity-90">
          <li>
            <strong>Окна доставки.</strong> Проверка границ времени и дедупликация отправок.
          </li>
          <li>
            <strong>События.</strong> Подписанные webhook-и и токен-ссылки, защита от повторных вызовов.
          </li>
          <li>
            <strong>«Пульс».</strong> Dead-man-switch с мягкими задержками и подтверждениями «я в порядке».
          </li>
        </ul>
      </section>

      {/* Права и доступ пользователя */}
      <section id="rights" className="scroll-mt-20 space-y-4">
        <h2 className="text-xl font-medium tracking-tight">Права и доступ</h2>
        <ul className="list-disc space-y-2 pl-5 opacity-90">
          <li>
            <strong>Минимизация данных.</strong> Сохраняем только необходимое для работы сервиса.
          </li>
          <li>
            <strong>Отзыв доступа.</strong> Токены и шаринги можно отозвать мгновенно.
          </li>
          <li>
            <strong>Экспорт.</strong> Пользователь может выгрузить свои данные.
          </li>
        </ul>
      </section>

      <footer className="border-t pt-6">
        <p className="text-sm opacity-70">
          Это краткая выжимка. Подробную спецификацию опубликуем после внутренней ревизии.
        </p>
      </footer>
    </main>
  );
}
