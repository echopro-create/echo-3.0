export const dynamic = "error"; // enforce static

export const metadata = {
  title: "ECHO — послания, которые будут доставлены позже"
};

export default function Page() {
  return (
    <>
      <section className="hero">
        <div className="wrap" style={{textAlign:'center'}}>
          <h1 className="title">Послания, которые будут доставлены позже…</h1>
          <p className="subtitle">
            Вы можете сказать важное даже тогда, когда вас уже не будет.
          </p>
          <div className="actions">
            <a className="btn" href="/messages/new" aria-label="Оставить послание — перейти к созданию">
              Оставить послание
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Почему это важно</h2>
          <p>Мы часто не успеваем сказать главное. Echo сохранит ваши слова и передаст их тогда, когда они нужны больше всего.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Как это работает</h2>
          <div className="grid3">
            <div className="card"><strong>1.</strong> Записываете текст, голос, видео или прикрепляете файлы.</div>
            <div className="card"><strong>2.</strong> Мы периодически спрашиваем, всё ли с вами в порядке.</div>
            <div className="card"><strong>3.</strong> Если ответа нет — сообщение доставляется адресатам.</div>
          </div>
        </div>
      </section>
    </>
  );
}
