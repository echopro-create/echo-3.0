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

      {/* ЖЁСТКИЙ, НО МАЛЕНЬКИЙ ПЭЙДЖЕР ДЛЯ КОЛЕСА */}
      <Script id="snap-wheel-helper" strategy="afterInteractive">{`
        (function(){
          var root = document.getElementById('snapper');
          if(!root) return;

          var sections = Array.prototype.slice.call(root.querySelectorAll('section[data-snap]'));
          if(!sections.length) return;

          function sectionTop(el){
            var rb = root.getBoundingClientRect();
            var eb = el.getBoundingClientRect();
            return eb.top - rb.top + root.scrollTop;
          }

          function currentIndex(){
            var y = root.scrollTop;
            var nearest = 0;
            var best = Infinity;
            for(var i=0;i<sections.length;i++){
              var t = sectionTop(sections[i]);
              var d = Math.abs(t - y);
              if(d < best){ best = d; nearest = i; }
            }
            return nearest;
          }

          var scrolling = false;
          var targetY = 0;
          function scrollToIndex(idx){
            idx = Math.max(0, Math.min(idx, sections.length - 1));
            targetY = sectionTop(sections[idx]);
            scrolling = true;
            try { root.scrollTo({ top: targetY, behavior: 'smooth' }); }
            catch(_) { root.scrollTop = targetY; scrolling = false; }
          }

          // Следим, когда «доскроллило»
          var rafId = 0;
          function tick(){
            if(!scrolling) return;
            if(Math.abs(root.scrollTop - targetY) < 2){
              scrolling = false;
              return;
            }
            rafId = requestAnimationFrame(tick);
          }
          root.addEventListener('scroll', function(){
            if(scrolling && rafId === 0) rafId = requestAnimationFrame(tick);
          });

          // Колесо: резкие жесты перехватываем, мелкие отдаем браузеру
          root.addEventListener('wheel', function(e){
            var dy = e.deltaY || 0;
            if(scrolling) { e.preventDefault(); return; }
            if(Math.abs(dy) < 40) return; // легкие подскроллы — нативно

            e.preventDefault();
            var idx = currentIndex();
            if(dy > 0) scrollToIndex(idx + 1);
            else scrollToIndex(idx - 1);
          }, { passive: false });

          // Стрелки/PageUp/PageDown/Space — поддержим навигацию с клавы
          root.addEventListener('keydown', function(e){
            if(scrolling) { e.preventDefault(); return; }
            var idx = currentIndex();
            if(e.key === 'PageDown' || e.key === 'ArrowDown' || (e.key === ' ' && !e.shiftKey)){
              e.preventDefault(); scrollToIndex(idx + 1);
            } else if(e.key === 'PageUp' || e.key === 'ArrowUp' || (e.key === ' ' && e.shiftKey)){
              e.preventDefault(); scrollToIndex(idx - 1);
            } else if(e.key === 'Home'){ e.preventDefault(); scrollToIndex(0); }
              else if(e.key === 'End'){ e.preventDefault(); scrollToIndex(sections.length - 1); }
          });

          // На всякий случай, чтоб фокус жил внутри контейнера
          root.tabIndex = 0;
        })();
      `}</Script>
    </div>
  );
}
