export const metadata = { title: "Настройки — ECHO" };

export default function SettingsPage(){
  return (
    <div className="wrap" style={{maxWidth:720}}>
      <h1 className="title" style={{textAlign:'left'}}>Настройки</h1>
      <div className="card" style={{marginTop:12}}>Частота heartbeat (заглушка).</div>
      <div className="card" style={{marginTop:12}}>Уведомления (заглушка).</div>
      <div className="card" style={{marginTop:12}}>Вы вошли как: user@example.com (заглушка)</div>
      <button className="btn" style={{marginTop:12}}>Выйти</button>
    </div>
  );
}
