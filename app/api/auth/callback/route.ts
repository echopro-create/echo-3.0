import { NextResponse } from "next/server";
export async function GET() {
  // TODO: обработка подтверждения OTP (методом Supabase или собственной логикой)
  return NextResponse.redirect(new URL("/messages", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
}
