import { Suspense } from "react";
import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = { title: "Вход — ECHO" };

// запрещаем пререндер и кэш, иначе экспорт снова рухнет
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
