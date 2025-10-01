import { Suspense } from "react";
import RecipientsClient from "./RecipientsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Получатели — ECHO" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense>
      <RecipientsClient />
    </Suspense>
  );
}
