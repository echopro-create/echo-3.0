export const metadata = { title: "Послания — ECHO" };

export default function MessagesPage() {
  return (
    <div className="container py-6 grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="title text-2xl font-semibold">Послания</h1>
        <a className="btn primary" href="/messages/new">Создать</a>
      </div>
      <div className="grid gap-3">
        <div className="card">Здесь будет список посланий с превью.</div>
      </div>
    </div>
  )
}
