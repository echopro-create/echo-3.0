import { NextRequest, NextResponse } from "next/server";

// Ставим httpOnly cookie с access token, чтобы middleware видел аутентификацию
export async function POST(req: NextRequest) {
  try {
    const { token, expiresIn } = await req.json();
    const access = String(token || "");
    const maxAge = Number(expiresIn || 3600); // сек

    if (!access) {
      return NextResponse.json({ error: "Нет токена" }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("sb-access-token", access, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Set cookie failed" }, { status: 500 });
  }
}

// Опционально: очистка сессии
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("sb-access-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
