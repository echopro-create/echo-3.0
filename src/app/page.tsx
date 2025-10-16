import { Header } from "@/components/header";
import { CTA } from "@/components/cta";
import { FormatsSection } from "@/components/sections/formats";
import { DeliverySection } from "@/components/sections/delivery";
import { PrivacySection } from "@/components/sections/privacy";
import { StartSection } from "@/components/sections/start";
import Link from "next/link";
import type { Route } from "next";
import { Lock, ShieldCheck, KeyRound, Shield } from "lucide-react";
import Script from "next/script";

export default function Home() {
  return (
    // ЕДИНСТВЕННЫЙ скролл-контейнер на всю страницу
    <div
      id="snapper"
      className="h-[100svh] overflow-y-auto overscroll-y-none [scrollbar-gutter:stable] snap-y snap-mandatory"
    >
      <Header />

      {/* ================= HERO: Layer A ================= */}
      <section
        data-snap
        className="relative flex h-[calc(100svh-56px)] snap-center [scroll-snap-stop:always] items-start justify-center overflow-hidden
                   bg-[radial-gradient(80%_60%_at_50%_10%,rgba(99,102,241,0.08),transparent_60%)]
                   dark:bg-[radial-gradient(80%_60%_at_50%_10%,rgba(56,189,248,0.08),transparent_60%)]"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 py-24">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div
              className="absolute left-1/2 top-[-10rem] h-[34rem] w-[68rem] -translate-x-1/2 rotate-[-10deg] blur-3xl
              bg-[radial-gradient(closest-side,rgba(99,102,241,0.28),transparent_70%)]
              dark:bg-[radial-gradient(closest-side,rgba(56,189,248,0.22),transparent_70%)]"
            />
            <div
              className="absolute right-[-14%] bottom-[-10rem] h-[28rem] w-[46rem] blur-3xl
              bg-[radial-gradient(closest-side,rgba(16,185,129,0.22),transparent_70%)]
              dark:bg-[radial-gradient(closest-side,rgba(250,204,21,0.18),transparent_70%)]"
            />
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
            Сообщения, которые приходят вовремя.
          </h1>

          <p className="max-w-2xl text-lg opacity-90 md:text-xl">
            Echo собирает текст, голос и видео в одно место и доставляет их по расписанию:
            по дате, событию или вашему «пульсу». Быстро, предсказуемо, без цирка.
          </p>

          <CTA />

          <p className="text-xs opacity-70">
            Можно отправить через годы, в нужный момент. Без спешки и лишнего шума.
          </p>

          <div className="w-full pt-4">
            <ul className="flex flex-wrap items-baseline gap-2.5 text-xs opacity-90">
              <li className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--fg)]/5 px-3 py-2 ring-1 ring-[color:var(--fg)]/10">
                <span className="inline-flex size-5 items-center justify-center rounded-md bg-[color:var(--fg)]/5 ring-1 ring-[color:var(--fg)]/15" aria-hidden="true">
                  <Lock className="size-3" aria-hidden="true" />
                </span>
                <span>Шифрование на устройстве</span>
              </li>
              <li className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--fg)]/5 px-3 py-2 ring-1 ring-[color:var(--fg)]/10">
                <span className="inline-flex size-5 items-center justify-center rounded-md bg-[color:var(--fg)]/5 ring-1 ring-[color:var(--fg)]/15" aria-hidden="true">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                </span>
                <span>RLS: доступ только владельцу</span>
              </li>
              <li className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--fg)]/5 px-3 py-2 ring-1 ring-[color:var(--fg)]/10">
                <span className="inline-flex size-5 items-center justify-center rounded-md bg-[color:var(--fg)]/5 ring-1 ring-[color:var(--fg)]/15" aria-hidden="true">
                  <KeyRound className="size-3" aria-hidden="true" />
                </span>
                <span>Ключи отдельно от данных</span>
              </li>
              <li className="inline-flex items-center gap-2 rounded-xl px-0 py-0">
                <Link
                  href={"/security" as Route}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ring-[color:var(--fg)]/15 hover:bg-[color:var(--fg)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="inline-flex size-5 items-center justify-center rounded-md bg-[color:var(--fg)]/5 ring-1 ring-[color:var(--fg)]/15" aria-hidden="true">
                    <Shield className="size-3" aria-hidden="true" />
                  </span>
                  <span className="underline underline-offset-4">Архитектура безопасности</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= Formats: Layer B ================= */}
      <section
        data-snap
        className="h-[calc(100svh-56px)] snap-center [scroll-snap-stop:always] bg-[color:var(--fg)]/3"
      >
        <div className="mx-auto w-full max-w-6xl px-4">
          <FormatsSection />
        </div>
      </section>

      {/* ================= Delivery: Layer C ================= */}
      <section
        data-snap
        className="h-[calc(100svh-56px)] snap-center [scroll-snap-stop:always] aura-soft"
      >
        <DeliverySection />
      </section>

      {/* ================= Privacy: Layer B ================= */}
      <section
        data-snap
        className="h-[calc(100svh-56px)] snap-center [scroll-snap-stop:always] bg-[color:var(--fg)]/3"
      >
        <PrivacySection />
      </section>

      {/* ================= Start: Layer D ================= */}
      <section
        data-snap
        className="h-[calc(100svh-56px)] snap-center [scroll-snap-stop:always] bg-[color:var(--fg)]/6"
      >
        <StartSection />
      </section>

      {/* Мини-пэйджер для резкого колеса. Без зависимостей и без Client Component. */}
      <Script id="snap-wheel-helper" strategy="afterInteractive">{`
        (function(){
          var root = document.getElementById('snapper');
          if(!root) return;
          var busy = false;
          var sections = Array.prototype.slice.call(root.querySelectorAll('section[data-snap]'));

          function nearestNext(dy){
            var y = root.scrollTop;
            if(dy > 0){
              for(var i=0;i<sections.length;i++){
                if(sections[i].offsetTop > y + 1) return sections[i];
              }
              return sections[sections.length-1];
            } else {
              var prev = null;
              for(var j=0;j<sections.length;j++){
                if(sections[j].offsetTop < y - 1) prev = sections[j]; else break;
              }
              return prev || sections[0];
            }
          }

          function release(){ busy = false; }
          root.addEventListener('wheel', function(e){
            var dy = e.deltaY || 0;
            if(Math.abs(dy) < 30) return;       // мелкие прокрутки оставляем браузеру
            if(busy) return;
            busy = true;
            e.preventDefault();

            var target = nearestNext(dy);
            if(target){
              try { target.scrollIntoView({behavior:'smooth', block:'center'}); }
              catch(_) { root.scrollTop = target.offsetTop; }
            }

            // подстрахуемся на 600 мс, или используем scrollend где доступен
            if('onscrollend' in root){
              var once = function(){ root.removeEventListener('scrollend', once); release(); };
              root.addEventListener('scrollend', once);
            } else {
              setTimeout(release, 600);
            }
          }, {passive:false});
        })();
      `}</Script>
    </div>
  );
}
