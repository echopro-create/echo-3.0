import { NextResponse } from "next/server";

export async function POST() {
  // TODO: принять файл, загрузить в Supabase Storage
  return NextResponse.json({ ok: true, path: "attachments/example" })
}
