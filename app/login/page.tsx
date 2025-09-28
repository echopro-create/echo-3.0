export const metadata = { title: "Вход — ECHO" };

export default function LoginPage(){
  return (
    <div className="wrap" style={{maxWidth:520}}>
      <h1 className="title" style={{textAlign:'left'}}>Вход</h1>
      <p className="subtitle" style={{textAlign:'left'}}>Введите email — мы пришлём 6‑значный код.</p>
      {/* OTP form placeholder */}
      <form className="card" style={{display:'grid',gap:12}}>
        <input type="email" placeholder="you@example.com" aria-label="Email" style={{padding:12,border:'1px solid #ccc',borderRadius:8}} />
        <button className="btn" type="submit">Получить код</button>
      </form>
    </div>
  );
}
