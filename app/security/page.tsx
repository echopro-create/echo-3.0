export const metadata = { title: "Безопасность — ECHO" };
export default function SecurityPage(){
  return (
    <div className="wrap" style={{maxWidth:820}}>
      <h1 className="title" style={{textAlign:'left'}}>Безопасность и приватность</h1>
      <div className="card" style={{display:'grid',gap:12}}>
        <div><strong>Шифрование:</strong> все данные шифруются на клиенте; в базе хранится шифротекст.</div>
        <div><strong>Доступ:</strong> получатели получают временные подписанные ссылки.</div>
        <div><strong>Хранение:</strong> Supabase Storage + RLS.</div>
        <div><strong>Юридически:</strong> соответствие GDPR (заглушка описания).</div>
      </div>
    </div>
  );
}
