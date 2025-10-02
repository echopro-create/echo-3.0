export const metadata = { title: "ECHO — Послания, которые будут доставлены позже…" };

export default function HomePage() {
  return (
    <section className="h-[calc(100vh-140px)] grid place-items-center">
      <div className="container text-center">
        <h1 className="title text-3xl md:text-5xl font-semibold fade-in-up">
          Послания, которые будут доставлены позже…
        </h1>
        <p className="mt-4 text-base md:text-lg text-[var(--mute)] fade-in-up delay-1">
          Запишите текст, голосовое сообщение или видео. Мы доставим их адресатам в нужный день, даже после вашей смерти.
        </p>
        <div className="mt-8 fade-in-up delay-2">
          <a className="btn primary" href="/messages/new">Оставить послание</a>
        </div>
      </div>
    </section>
  )
}
