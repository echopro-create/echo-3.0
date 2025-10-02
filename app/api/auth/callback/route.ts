import { NextResponse } from "next/server";
export async function GET() {
  // Здесь можно обработать редирект после подтверждения
  return NextResponse.redirect(new URL("/messages/new", process.env.NEXT_PUBLIC_APP_URL || "https://echoproject.space"))
}
