import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function supabaseFor(req: NextRequest) {
  const access = req.cookies.get("sb-access-token")?.value;
  return createClient(url, anon, {
    global: { headers: access ? { Authorization: `Bearer ${access}` } : {} },
  });
}

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const supabase = supabaseFor(req);
    const { data: u, error: ue } = await supabase.auth.getUser();
    if (ue || !u?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = ctx.params.id;
    const body = await req.json();
    const name = body?.name !== undefined ? String(body.name).trim() : undefined;
    const email = body?.email !== undefined ? String(body.email).trim() : undefined;

    if (email !== undefined && !email.includes("@")) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }

    const update: Record<string, any> = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Нет полей для обновления" }, { status: 400 });
    }

    // Обновляем только свою запись (RLS это и так держит)
    const { data, error } = await supabase
      .from("recipients")
      .update(update)
      .eq("id", id)
      .select("id,name,email,created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to update recipient" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const supabase = supabaseFor(req);
    const { data: u, error: ue } = await supabase.auth.getUser();
    if (ue || !u?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = ctx.params.id;

    const { error } = await supabase.from("recipients").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to delete recipient" }, { status: 500 });
  }
}
