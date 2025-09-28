import { NextResponse } from "next/server";
export async function POST(){
  // TODO: verify OTP and create session
  return NextResponse.json({ ok: true });
}
