export const metadata = { title: "Новое послание — ECHO" };

export default function NewMessagePage(){
  return (
    <div className="wrap py-10" style={{maxWidth:720}}>
      <h1 className="title mb-6" style={{textAlign:'left'}}>Создать послание</h1>
      <div className="card grid gap-4">
        <strong>Тип послания</strong>
        <div className="flex gap-2 flex-wrap">
          <a className="btn secondary" href="#text">Текст</a>
          <a className="btn secondary" href="#audio">Голос</a>
          <a className="btn secondary" href="#video">Видео</a>
          <a className="btn secondary" href="#files">Файлы</a>
        </div>
        <div id="text" className="card">Редактор текста (заглушка)</div>
        <div id="audio" className="card">Запись голоса (заглушка)</div>
        <div id="video" className="card">Запись видео (заглушка)</div>
        <div id="files" className="card">Загрузка файлов (заглушка, приватный бакет)</div>
      </div>
    </div>
  );
}
