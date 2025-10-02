export const metadata = { title: "Как это работает — ECHO" };
export default function HowPage() {
  return (
    <div className="container py-10 grid gap-3">
      <h1 className="title text-2xl font-semibold">Как это работает</h1>
      <ol className="list-decimal pl-6 grid gap-2">
        <li>Вы создаете послание (текст/голос/видео/файлы).</li>
        <li>Выбираете доставку: по пульсу или по дате.</li>
        <li>Мы храним зашифрованно и доставляем адресатам позже.</li>
      </ol>
    </div>
  )
}
