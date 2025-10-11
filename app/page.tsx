// app/page.tsx
"use client";

import Script from "next/script";

export default function Home() {
  const RAW_HTML = `
<a class="skip-link" href="#home">К содержанию</a>

<nav class="dots" aria-label="Навигация по экранам">
  <a href="#home"     aria-label="Герой"              class="dot" data-target="home"></a>
  <a href="#formats"  aria-label="Форматы"            class="dot" data-target="formats"></a>
  <a href="#delivery" aria-label="Функционал"         class="dot" data-target="delivery"></a>
  <a href="#privacy"  aria-label="Конфиденциальность" class="dot" data-target="privacy"></a>
</nav>

<main class="snap" id="snap-root" tabindex="-1">

  <!-- Экран 1 -->
  <article id="home" class="screen screen-dark" aria-label="Герой">
    <div class="orb">
      <div class="center">
        <h1>Ваши&nbsp;послания&nbsp;близким</h1>
        <h2 class="subtitle">
          Запишите текст, голосовое сообщение или видео. Мы доставим их адресатам в нужный день, после вашей смерти.
          Ваши слова останутся живыми, когда вас уже не будет рядом. Мы сохраним их бережно и передадим тем, кому вы не смогли что-либо сказать при жизни.
        </h2>
        <a class="btn" data-alt="Это займёт 2 минуты" href="/messages/new">Создать послание</a>
      </div>
      <div class="r r1"></div><div class="r r2"></div><div class="r r3"></div><div class="r r4"></div>
      <span class="section-mark" aria-hidden="true" data-mark="◎"></span>
    </div>
  </article>

  <!-- Экран 2: форматы -->
  <article id="formats" class="screen screen-light" aria-label="Форматы">
    <div class="container narrow">
      <h2 class="title title-glow">Сказать можно по-разному</h2>
      <p class="lead">
        Всё, что вы оставляете — слова, голос, видео — однажды станет самым ценным напоминанием о вас.
        <span class="brand">ECHO</span> делает так, чтобы ваши послания были доставлены.
        <span class="muted">К каждому посланию можно прикрепить файлы.</span>
      </p>
      <p class="micro">Мы храним не только файлы, но и спокойствие.</p>

      <div class="formats-split">
        <section class="slab format-unit">
          <header class="slab-head">
            <span class="glyph glyph-text" aria-hidden="true"></span>
            <h3>Текст</h3>
          </header>
          <p>Письмо, несколько абзацев или инструкции. То, что важно прочитать тогда, когда вы запланировали.</p>

          <div class="divider"></div>

          <header class="slab-head">
            <span class="glyph glyph-voice" aria-hidden="true"></span>
            <h3>Голос</h3>
          </header>
          <p>Запись прямо в браузере. Ничего лишнего: ваш голос сохранён и передан адресатам в нужный день.</p>
        </section>

        <section class="slab format-unit slab-light">
          <header class="slab-head">
            <span class="glyph glyph-video" aria-hidden="true"></span>
            <h3>Видео</h3>
          </header>
          <p>Короткое обращение или воспоминание. Ваш взгляд и слова останутся с теми, кому это нужно.</p>

          <div class="divider"></div>

          <header class="slab-head">
            <span class="glyph glyph-attach" aria-hidden="true"></span>
            <h3>Вложения</h3>
          </header>
          <p>Фото, документы и архивы рядом с посланием. Храним зашифрованно. Доступ — только адресатам.</p>
        </section>
      </div>

      <span class="section-mark" aria-hidden="true" data-mark="💬"></span>
    </div>
  </article>

  <!-- Экран 3: функционал -->
  <article id="delivery" class="screen screen-dark function-dark" aria-label="Функционал">
    <div class="container narrow">
      <h2 class="title title-glow">Как работает ECHO</h2>
      <p class="lead">
        Сервис хранит ваши послания, следит за «пульсом» и отправляет их, когда наступает нужный момент.
      </p>
      <p class="micro">Иногда тишина — тоже сигнал.</p>

      <div class="func-split">
        <section class="slab slab-main">
          <header class="slab-head">
            <span class="glyph glyph-calendar" aria-hidden="true"></span>
            <h3>Доставка по дате</h3>
          </header>
          <p>Укажите точный день и время. За сутки напомним, можно перенести или отменить. Если почта не отвечает, делаем повторные попытки.</p>

          <div class="divider"></div>

          <header class="slab-head">
            <span class="glyph glyph-heart" aria-hidden="true"></span>
            <h3>Доставка по «пульсу» <span class="badge breath">без датчиков</span></h3>
          </header>
          <p>
            Периодически отправляем короткое письмо: «Вы на связи?» Ответили — таймер обнуляется.
            <span class="accent-line">Если ответов нет несколько раз подряд в выбранный срок, отправка запускается автоматически.</span>
          </p>
        </section>

        <aside class="slab slab-side lift">
          <section class="unit">
            <header class="slab-head">
              <span class="glyph glyph-compose" aria-hidden="true"></span>
              <h3>Создание послания</h3>
            </header>
            <p>Текст, голос, видео и файлы загружаются прямо в браузере и шифруются перед сохранением.</p>
          </section>

          <section class="unit">
            <header class="slab-head">
              <span class="glyph glyph-link" aria-hidden="true"></span>
              <h3>Доставка адресатам</h3>
            </header>
            <p>Одноразовые зашифрованные ссылки с ограничением по времени и просмотрам. Получатель видит только своё послание, вы получаете подтверждение доставки.</p>
          </section>
        </aside>
      </div>

      <!-- мини-кейсы -->
      <ul class="mini-cases" aria-label="Кому подходит каждый режим">
        <li><strong>Дата.</strong> Поздравления детям на будущие дни рождения. Письмо себе через год. Точные события, где важен календарь.</li>
        <li><strong>Пульс.</strong> Если долго не отвечаете — послания уйдут адресатам. Полезно, когда дата неизвестна заранее.</li>
      </ul>

      <span class="section-mark" aria-hidden="true" data-mark="⎯⎯"></span>
    </div>
  </article>

  <!-- Пауза-перебивка -->
  <div class="divider-pause" aria-hidden="true">•••&nbsp;&nbsp;С этого момента ECHO действует сам&nbsp;&nbsp;•••</div>

  <!-- Экран 4: конфиденциальность -->
  <article id="privacy" class="screen screen-dark privacy-dark" aria-label="Конфиденциальность">
    <div class="container narrow">
      <h2 class="title title-glow">Конфиденциальность и безопасность</h2>
      <p class="lead">
        Послания принадлежат вам. Мы шифруем данные до хранения, ограничиваем доступ и даём полный контроль над тем,
        кто и когда увидит ваши слова.
      </p>
      <p class="micro">Меньше следов: собираем минимум метаданных и не используем данные для рекламы.</p>

      <div class="privacy-split">
        <section class="slab slab-privacy-main">
          <header class="slab-head">
            <span class="glyph glyph-lock" aria-hidden="true"></span>
            <h3>Шифрование и передача</h3>
          </header>
          <ul class="checklist">
            <li><span class="tick" aria-hidden="true"></span>Файлы и сообщения шифруются перед сохранением.</li>
            <li><span class="tick" aria-hidden="true"></span>Передача по защищённым каналам (HTTPS/TLS).</li>
            <li><span class="tick" aria-hidden="true"></span>Ключи хранятся отдельно от содержимого.</li>
          </ul>

          <div class="divider"></div>

          <header class="slab-head">
            <span class="glyph glyph-shield" aria-hidden="true"></span>
            <h3>Доступ только адресатам</h3>
          </header>
          <ul class="checklist">
            <li><span class="tick" aria-hidden="true"></span>Подписанные ссылки с TTL и лимитом просмотров.</li>
            <li><span class="tick" aria-hidden="true"></span>Можно отозвать доступ в любой момент.</li>
            <li><span class="tick" aria-hidden="true"></span>Подтверждения каждой доставки.</li>
          </ul>

          <div class="divider"></div>

          <header class="slab-head">
            <span class="glyph glyph-eu" aria-hidden="true"></span>
            <h3>Хранение и юрисдикция</h3>
          </header>
          <ul class="checklist">
            <li><span class="tick" aria-hidden="true"></span>Инфраструктура в ЕС.</li>
            <li><span class="tick" aria-hidden="true"></span>Понятная политика хранения и удаления.</li>
            <li><span class="tick" aria-hidden="true"></span>Журнал событий: создание, «пульс», отправка.</li>
          </ul>
        </section>

        <aside class="slab slab-privacy-side">
          <section class="unit">
            <header class="slab-head">
              <span class="glyph glyph-revoke" aria-hidden="true"></span>
              <h3>Ваш контроль</h3>
            </header>
            <p class="mutedish">Переносите дату, ставьте «пульс» на паузу, удаляйте или экспортируйте послания. Всё — из вашего кабинета.</p>
            <div class="pill-row">
              <span class="pill">Отзыв доступа</span>
              <span class="pill">Экспорт</span>
              <span class="pill">Удаление</span>
            </div>
          </section>

          <section class="unit">
            <header class="slab-head">
              <span class="glyph glyph-faq" aria-hidden="true"></span>
              <h3>Короткие ответы</h3>
            </header>

            <details class="qa">
              <summary>Что видит получатель?</summary>
              <p>Только своё послание и вложения по одноразовой ссылке с ограничениями. Остальные получатели ему недоступны.</p>
            </details>
            <details class="qa">
              <summary>Можно ли отозвать доступ после отправки?</summary>
              <p>Да. Ссылка перестанет работать сразу, даже если она ещё не была открыта.</p>
            </details>
            <details class="qa">
              <summary>Храните ли вы черновики?</summary>
              <p>Да, как обычные послания. Их можно удалить без следа.</p>
            </details>
          </section>
        </aside>
      </div>

      <div class="trust-row">
        <span class="trust">Зашифровано</span>
        <span class="trust">Подписанные ссылки</span>
        <span class="trust">Хранение в ЕС</span>
        <span class="trust">Журнал событий</span>
      </div>

      <div class="legal-links">
        <a class="link" href="/legal/storage.html">Политика хранения</a>
        <span aria-hidden="true">·</span>
        <a class="link" href="/legal/deletion.html">Удаление данных</a>
        <span aria-hidden="true">·</span>
        <a class="link" href="/legal/log.html">Журнал событий</a>
      </div>

      <p class="disclaimer">
        <strong>ECHO не является завещанием.</strong> Это сервис отложенной доставки сообщений.
        Юридические сценарии и ограничения — в <a class="link" href="/help/legal.html">справке</a>.
      </p>

      <span class="section-mark" aria-hidden="true" data-mark="🔒"></span>
    </div>
  </article>
</main>

<footer class="footer" aria-label="Низ страницы">
  <div class="container footwrap">
    <small>© 2025 ECHO</small>
  </div>

  <!-- Статичная линия-пульс -->
  <div class="pulse-line" aria-hidden="true">
    <svg viewBox="0 0 600 60" preserveAspectRatio="xMidYMid meet">
      <path d="M0,30 L120,30 150,10 180,45 210,20 240,30 330,30 360,12 390,42 420,18 450,30 600,30"
            fill="none" stroke="rgba(159,224,255,.55)" stroke-width="1.2" />
    </svg>
  </div>
</footer>
  `.trim();

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: RAW_HTML }} />
      {/* Скрипты из исходного HTML — как исполняемые, после интерактива */}
      <Script id="landing-scripts" strategy="afterInteractive">{`
        // Подсветка активной точки при скролле
        (function(){
          const sections = Array.from(document.querySelectorAll('.screen[id]'));
          const dots = new Map(Array.from(document.querySelectorAll('.dots .dot')).map(a => [a.dataset.target, a]));
          let current = null;

          const setActive = id => {
            if (current === id) return;
            current = id;
            dots.forEach(d => { d.classList.remove('active'); d.removeAttribute('aria-current'); });
            if (dots.has(id)) {
              const el = dots.get(id);
              el.classList.add('active');
              el.setAttribute('aria-current', 'true');
            }
            const hash = '#' + id;
            if (location.hash !== hash && history.replaceState) history.replaceState(null, '', hash);
          };

          const io = new IntersectionObserver((entries) => {
            const visible = entries
              .filter(e => e.isIntersecting)
              .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible) setActive(visible.target.id);
          }, { threshold: [0.55, 0.8] });

          sections.forEach(s => io.observe(s));
        })();

        // Флаг готовности шрифтов/страницы для hero-анимации
        (function(){
          const ready = () => document.documentElement.classList.add('is-ready');
          if (document.fonts && document.fonts.ready) { document.fonts.ready.then(ready); }
          window.addEventListener('load', ready, { once: true });
        })();

        // Вход по вьюпорту для блоков 2,3,4
        (function(){
          const ids = ['#formats','#delivery','#privacy'];
          const io = new IntersectionObserver((entries, obs)=>{
            entries.forEach(e=>{
              if (e.isIntersecting){
                e.target.classList.add('is-inview');
                obs.unobserve(e.target);
              }
            });
          }, { threshold: 0.25 });
          ids.forEach(id => { const el = document.querySelector(id); if (el) io.observe(el); });
        })();

        // CTA hover-текст только на устройствах с точным курсором
        (function(){
          const fine = matchMedia('(any-pointer: fine)').matches;
          const btn = document.querySelector('#home .btn');
          if (!btn || !fine) return;
          const base = btn.textContent;
          const alt  = btn.getAttribute('data-alt') || base;
          btn.addEventListener('mouseenter', () => { btn.textContent = alt; });
          btn.addEventListener('mouseleave', () => { btn.textContent = base; });
          btn.addEventListener('blur',       () => { btn.textContent = base; }, true);
        })();

        // Микротексты на будущее
        window.__echoTexts = {
          mailRetry:  "Мы не смогли доставить письмо сразу. Повторим попытку автоматически.",
          pulseMissed:"Пульс не получен несколько раз. Отправка посланий запускается по правилам.",
          pulsePaused:"Пульс на паузе. Послания не отправятся, пока вы не возобновите пульс.",
          revoked:    "Доступ к посланию отозван."
        };

        // Безкуковая аналитика: клик по CTA
        (function(){
          const send = (name, data) => {
            if (!navigator.sendBeacon) return;
            try { navigator.sendBeacon('/api/track', new Blob([JSON.stringify({ name, ts: Date.now(), ...data })], {type:'application/json'})); } catch(e){}
          };
          document.querySelector('#home .btn')?.addEventListener('click', ()=> send('cta_click', { path: location.pathname }));
        })();
      `}</Script>
    </>
  );
}
