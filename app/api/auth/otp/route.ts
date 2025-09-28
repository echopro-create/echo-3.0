import { NextResponse } from "next/server";
export async function POST(){
  // TODO: issue OTP to email via Supabase
  return NextResponse.json({ ok: true });
}
