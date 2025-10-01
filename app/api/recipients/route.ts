import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function supabaseFor(req: NextRequest) {
  const access = req.cookies.get("sb-access-token")?.value;
  const client = createClient(url, anon, {
    global: {
      headers: access ? { Authorization: `Bearer ${access}` } : {},
    },
  });
  return client;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = supabaseFor(req);
    // Получаем user из токена, чтобы быстро отвалить анонимов
    const { data: u, error: ue } = await supabase.auth.getUser();
    if (ue || !u?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("recipients")
      .select("id,name,email,created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to list recipients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseFor(req);
    const { data: u, error: ue } = await supabase.auth.getUser();
    if (ue || !u?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();

    if (!name || !email.includes("@")) {
      return NextResponse.json({ error: "Укажите имя и корректный email" }, { status: 400 });
    }

    // Вставляем с user_id = auth.uid(), RLS проверит владельца
    const { data, error } = await supabase
      .from("recipients")
      .insert({ user_id: u.user.id, name, email })
      .select("id,name,email,created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create recipient" }, { status: 500 });
  }
}
