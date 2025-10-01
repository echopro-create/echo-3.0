import { NextResponse } from "next/server";
export async function POST() {
  // TODO: отправка OTP через Supabase auth OTP или через почтовый провайдер
  return NextResponse.json({ ok: false, message: "Not implemented" }, { status: 501 });
}
