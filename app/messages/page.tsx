export const metadata = { title: "Послания — ECHO" };

export default function MessagesPage(){
  return (
    <div className="wrap">
      <h1 className="title" style={{textAlign:'left'}}>Ваши послания</h1>
      <div className="card" style={{marginTop:12}}>Статус-панель: активные послания, ближайшая доставка, следующая проверка пульса.</div>
      <div className="card" style={{marginTop:12}}>Таймлайн жизни посланий (заглушка).</div>
      <div className="card" style={{marginTop:12}}>Список посланий (заглушка).</div>
    </div>
  );
}
