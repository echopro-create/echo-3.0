export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm opacity-70">
          © {year} Echo. Версия 3.0. Всё по уму, без цирка.
        </div>
        <nav className="flex flex-wrap gap-4 text-sm opacity-80">
          <a href="#formats" className="hover:opacity-100">
            Форматы
          </a>
          <a href="#delivery" className="hover:opacity-100">
            Доставка
          </a>
          <a href="#privacy" className="hover:opacity-100">
            Приватность
          </a>
          <a
            href="https://github.com/echopro-create/echo-3.0"
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-100"
          >
            GitHub
          </a>
          <a
            href="mailto:hello@echoproject.space"
            className="hover:opacity-100"
          >
            Контакты
          </a>
        </nav>
      </div>
    </footer>
  );
}
