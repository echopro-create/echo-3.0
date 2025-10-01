export const metadata = {
  title: "Послания, которые будут доставлены позже… — ECHO"
};

export default function HomePage() {
  return (
    <section className="hero relative overflow-hidden">
      <div className="rings" />
      <div className="wrap grid gap-6 place-items-center text-center">
        <h1 className="title opacity-0 animate-fadein" style={{animationDelay:"0ms"}}>
          Послания, которые будут доставлены позже…
        </h1>
        <p className="subtitle max-w-2xl opacity-0 animate-fadein" style={{animationDelay:"200ms"}}>
          Мы доставим их адресатам в нужный день, даже после вашей смерти.
        </p>
        <a href="/messages/new" className="btn opacity-0 animate-fadein" style={{animationDelay:"400ms"}}>
          Оставить послание
        </a>
      </div>
    </section>
  );
}
