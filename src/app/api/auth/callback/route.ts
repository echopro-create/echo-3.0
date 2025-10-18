import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Разрешаем редирект только на локальные пути внутри сайта */
function safePath(p: string | null | undefined): string {
  const fallback = "/messages";
  if (!p) return fallback;
  // только относительный путь типа /foo, без // и протоколов
  if (p.startsWith("/") && !p.startsWith("//") && !p.includes("://")) return p;
  return fallback;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams, origin } = url;

  const code = searchParams.get("code"); // OAuth/PKCE
  const token_hash = searchParams.get("token_hash"); // OTP (magic link / recovery / invite / email_change)
  const typeParam = searchParams.get("type"); // часто приходит как 'email' для маглинка
  const nextParam = searchParams.get("next") ?? searchParams.get("redirect_to");

  const redirectTo = new URL(safePath(nextParam), origin);
  const supabase = await createClient();

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(new URL("/login?error=auth_code", origin));
      }
      return NextResponse.redirect(redirectTo);
    }

    if (token_hash) {
      // Допустимые типы для verifyOtp с token_hash — только email-ветка:
      // 'magiclink' | 'recovery' | 'invite' | 'email_change' | 'signup'
      type EmailOtpType =
        | "magiclink"
        | "recovery"
        | "invite"
        | "email_change"
        | "signup";

      // Supabase часто присылает ?type=email для маглинка — маппим на 'magiclink'.
      const normalized: EmailOtpType = ((): EmailOtpType => {
        switch ((typeParam || "").toLowerCase()) {
          case "recovery":
            return "recovery";
          case "invite":
            return "invite";
          case "email_change":
            return "email_change";
          case "signup":
            return "signup";
          // "email" и "magiclink" трактуем как magiclink
          case "email":
          case "magiclink":
          default:
            return "magiclink";
        }
      })();

      const { error } = await supabase.auth.verifyOtp({
        type: normalized,
        token_hash,
      });
      if (error) {
        return NextResponse.redirect(new URL("/login?error=otp", origin));
      }
      return NextResponse.redirect(redirectTo);
    }

    // Вообще ничего не пришло — высылаем обратно на логин
    return NextResponse.redirect(new URL("/login?error=missing", origin));
  } catch {
    // Если что-то горит — не устраиваем фейерверк, просто на логин
    return NextResponse.redirect(new URL("/login?error=unexpected", origin));
  }
}
