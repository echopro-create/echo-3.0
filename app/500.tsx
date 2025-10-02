export default function Error500() {
  return (
    <div className="container py-20">
      <h1 className="title text-2xl font-semibold">Ошибка сервера</h1>
      <p className="mt-2 text-[var(--mute)]">Мы уже чиним это. Попробуйте обновить страницу позже.</p>
      <a className="btn primary mt-6" href="/">На главную</a>
    </div>
  )
}
