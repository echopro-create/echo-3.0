import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ items: [] });
}

export async function POST(req: Request) {
  // TODO: сохранить сообщение в БД
  const body = await req.json().catch(()=>({}))
  return NextResponse.json({ ok: true, id: "draft", body })
}
