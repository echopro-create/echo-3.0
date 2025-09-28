export const metadata = { title: "Новое послание — ECHO" };

export default function NewMessagePage(){
  return (
    <div className="wrap" style={{maxWidth:720}}>
      <h1 className="title" style={{textAlign:'left'}}>Создать послание</h1>
      <div className="card" style={{display:'grid',gap:12}}>
        <strong>Тип послания</strong>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <a className="btn secondary" href="#text">Текст</a>
          <a className="btn secondary" href="#audio">Голос</a>
          <a className="btn secondary" href="#video">Видео</a>
          <a className="btn secondary" href="#files">Файлы</a>
        </div>
        <div id="text" className="card">Редактор текста (заглушка)</div>
        <div id="audio" className="card">Запись голоса (заглушка)</div>
        <div id="video" className="card">Запись видео (заглушка)</div>
        <div id="files" className="card">Загрузка файлов: drag & drop (заглушка)</div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn secondary">Сохранить как черновик</button>
          <button className="btn">Назначить доставку</button>
        </div>
      </div>
    </div>
  );
}
