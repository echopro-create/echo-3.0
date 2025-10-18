import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Безопасность — Echo",
  description:
    "Как Echo защищает ваши послания: шифрование, контроль доступа, хранение и удаление данных.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <>
      <Header />
      <main id="main" className="relative mx-auto max-w-6xl px-4" role="main" aria-label="Раздел безопасности">
        <section className="relative w-full py-20 md:py-24" aria-labelledby="sec-title">
          <div className="mx-auto max-w-3xl">
            <h1 id="sec-title" className="text-4xl md:text-6xl font-semibold tracking-tight text-[color:var(--fg)]">
              Безопасность
            </h1>
            <p className="mt-5 max-w-prose text-[color:var(--muted)] md:text-lg">
              Коротко: приватность по умолчанию. Ни маркетинговых пикселей, ни «случайной» телеметрии. Вы контролируете, кто и когда
              увидит послания, а мы отвечаем за шифрование, хранение и доставку.
            </p>
          </div>
        </section>

        <section className="relative w-full border-t border-black/10 py-12 md:py-16" aria-labelledby="crypto-title">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-12">
            <header className="md:col-span-4">
              <h2 id="crypto-title" className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
                Шифрование и данные
              </h2>
            </header>
            <div className="md:col-span-8">
              <ul className="space-y-3 text-sm leading-relaxed text-[color:var(--muted)]">
                <li>
                  <strong className="text-[color:var(--fg)]">Транспорт</strong>: весь трафик шифруется (HTTPS/TLS). Между клиентом и
                  сервером едут только зашифрованные соединения.
                </li>
                <li>
                  <strong className="text-[color:var(--fg)]">Хранение</strong>: медиа и файлы хранятся в объектном хранилище, база — в
                  управляемом SQL. Резервные копии согласно политике хранения.
                </li>
                <li>
                  <strong className="text-[color:var(--fg)]">Минимизация</strong>: собираем только то, что нужно для работы триггеров и
                  доставки. Никаких сторонних рекламных SDK.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="relative w-full border-t border-black/10 py-12 md:py-16" aria-labelledby="access-title">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-12">
            <header className="md:col-span-4">
              <h2 id="access-title" className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
                Доступ и аутентификация
              </h2>
            </header>
            <div className="md:col-span-8">
              <ul className="space-y-3 text-sm leading-relaxed text-[color:var(--muted)]">
                <li>
                  <strong className="text-[color:var(--fg)]">Авторизация</strong>: доступ к посланиям только их владельцу до момента
                  доставки. Получатели видят контент лишь после наступления условий.
                </li>
                <li>
                  <strong className="text-[color:var(--fg)]">Сессии</strong>: защищённые cookie, контроль сроков жизни, отзыв сессий при
                  выходе.
                </li>
                <li>
                  <strong className="text-[color:var(--fg)]">Роли</strong>: минимум ролей, принцип наименьших привилегий для внутренних
                  систем.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="relative w-full border-t border-black/10 py-12 md:py-16" aria-labelledby="delivery-title">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-12">
            <header className="md:col-span-4">
              <h2 id="delivery-title" className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
                Доставка и триггеры
              </h2>
            </header>
            <div className="md:col-span-8">
              <ul className="space-y-3 text-sm leading-relaxed text-[color:var(--muted)]">
                <li>
                  <strong className="text-[color:var(--fg)]">Триггеры</strong>: дата, событие или «после моей смерти». Перед отправкой
                  выполняется верификация условия.
                </li>
                <li>
                  <strong className="text-[color:var(--fg)]">Журнал</strong>: фиксируем события доставки и статусы. Вы видите, что и когда
                  произошло.
                </li>
                <li>
                  <strong className="text-[color:var(--fg)]">Повторы</strong>: в случае временной недоступности получателя предпринимаются
                  повторные попытки согласно политике ретраев.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="relative w-full border-t border-black/10 py-12 md:py-16" aria-labelledby="control-title">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-12">
            <header className="md:col-span-4">
              <h2 id="control-title" className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
                Управление и удаление
              </h2>
            </header>
            <div className="md:col-span-8">
              <ul className="space-y-3 text-sm leading-relaxed text-[color:var(--muted)]">
                <li>
                  <strong className="text-[color:var(--fg)]">Редактирование</strong>: можно менять получателей и условия доставки до
                  наступления триггера.
                </li>
                <li>
                  <strong className="text-[color:var(--fg)]">Удаление</strong>: полное удаление посланий и файлов по запросу владельца.
                </li>
                <li>
                  <strong className="text-[color:var(--fg)]">Экспорт</strong>: выгрузка ваших данных по запросу.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="relative w-full border-t border-black/10 py-12 md:py-16" aria-labelledby="legal-title">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-12">
            <header className="md:col-span-4">
              <h2 id="legal-title" className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
                Прозрачность
              </h2>
            </header>
            <div className="md:col-span-8">
              <ul className="space-y-3 text-sm leading-relaxed text-[color:var(--muted)]">
                <li>
                  <strong className="text-[color:var(--fg)]">Логи доступа</strong>: критичные действия журналируются и доступны вам для
                  аудита.
                </li>
                <li>
                  <strong className="text-[color:var(--fg)]">Запросы органов</strong>: соблюдаем закон. Передаём только то, что обязаны, в
                  пределах правовых требований.
                </li>
                <li>
                  <strong className="text-[color:var(--fg)]">Ответственность</strong>: SLA и договорные условия публикуются отдельно.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="relative w-full border-t border-black/10 py-12 md:py-20" aria-labelledby="closing-title">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="closing-title" className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--fg)]">
              Вопросы по безопасности
            </h2>
            <p className="mx-auto mt-4 max-w-prose text-[color:var(--muted)] md:text-lg">
              Напишите нам:{" "}
              <a
                href="mailto:hello@echoproject.space"
                className="underline decoration-black/30 underline-offset-4 hover:decoration-black/60"
              >
                hello@echoproject.space
              </a>
              . Отвечаем по делу и без тумана.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
