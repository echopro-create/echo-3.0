import { Header } from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative mx-auto flex min-h-[100svh] max-w-6xl items-center justify-center px-4">
        {/* Единственная сцена без свечения и градиентов */}
        <section
          className="relative w-full rounded-3xl px-0 py-24 md:py-28"
          aria-label="Echo — единственная сцена"
        >
          <div className="mx-auto max-w-3xl text-left md:text-center">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-100 md:text-6xl">
              Послания, которые будут доставлены после нас.
            </h1>

            <p className="mt-6 text-base leading-relaxed text-neutral-300 md:text-lg">
              Echo хранит ваши текст, голос, видео или файлы и доставляет их по дате, событию или после вашей
              смерти. Мы доставим всё в нужное время.
            </p>

            <div className="mt-10 flex gap-4 md:justify-center">
              <Button asChild size="lg" className="px-6">
                <Link href="/messages/new">Создать послание</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
