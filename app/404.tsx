export default function NotFound() {
  return (
    <div className="container py-20">
      <h1 className="title text-2xl font-semibold">Страница не найдена</h1>
      <p className="mt-2 text-[var(--mute)]">Похоже, вы не туда свернули.</p>
      <a className="btn primary mt-6" href="/">На главную</a>
    </div>
  )
}
