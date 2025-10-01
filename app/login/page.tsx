import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata = { title: "Вход — ECHO" };

export default function Page() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
