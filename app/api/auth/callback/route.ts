import { NextRequest, NextResponse } from "next/server";

function getCookieDomain(host: string | null): string | undefined {
  if (!host) return undefined;
  // убираем порт
  const h = host.split(":")[0]?.toLowerCase() || "";
  // локалхостам домен не задаем
  if (h === "localhost") return undefined;
  if (h.endsWith(".local")) return undefined;

  // если поддомен (www.echoproject.space) — ставим на корень (.echoproject.space)
  const parts = h.split(".");
  if (parts.length >= 3) {
    const root = parts.slice(-2).join(".");
    return "." + root;
  }
  // уже корень (echoproject.space)
  return "." + h;
}

export async function POST(req: NextRequest) {
  try {
    const { token, refreshToken, expiresIn } = await req.json();
    const access = String(token || "");
    const refresh = refreshToken ? String(refreshToken) : "";
    const maxAge = Number(expiresIn || 3600); // сек

    if (!access) {
      return NextResponse.json({ error: "Нет access token" }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });

    const domain = getCookieDomain(req.headers.get("host"));

    // Основная кука
    res.cookies.set("sb-access-token", access, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge,
      domain, // важно для www.<->root
    });

    // Опционально кладем refresh, если прислали
    if (refresh) {
      res.cookies.set("sb-refresh-token", refresh, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // неделя
        domain,
      });
    }

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Set cookie failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const domain = getCookieDomain(req.headers.get("host"));
  res.cookies.set("sb-access-token", "", {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0, domain,
  });
  res.cookies.set("sb-refresh-token", "", {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0, domain,
  });
  return res;
}
