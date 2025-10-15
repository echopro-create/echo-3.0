"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <div className="flex gap-3">
      <Button asChild size="lg" className="rounded-xl">
        <Link href="#formats">Что умеет</Link>
      </Button>
      <Button asChild variant="outline" size="lg" className="rounded-xl">
        <Link href="#start">Посмотреть демо</Link>
      </Button>
    </div>
  );
}
