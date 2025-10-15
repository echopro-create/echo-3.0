import { Header } from "@/components/header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4">
        <section className="flex min-h-[70svh] flex-col items-start justify-center gap-6 py-16">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            Сообщения, которые приходят вовремя.
          </h1>
          <p className="max-w-2xl text-base opacity-80 md:text-lg">
            Echo собирает текст, голос и видео в одно место и доставляет их по расписанию:
            по дате, событию или вашему «пульсу». Быстро, предсказуемо, без цирка.
          </p>
          <div className="flex gap-3">
            <a
              href="#start"
              className="inline-flex h-10 items-center rounded-xl px-4 font-medium ring-1 ring-[color:var(--fg)]/15 hover:bg-[color:var(--fg)]/5"
            >
              Посмотреть демо
            </a>
            <a
              href="#formats"
              className="inline-flex h-10 items-center rounded-xl px-4 font-medium bg-[color:var(--fg)] text-white dark:text-black"
            >
              Что умеет
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
