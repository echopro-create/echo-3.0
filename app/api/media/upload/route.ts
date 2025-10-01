import { NextResponse } from "next/server";
export async function POST(){ return NextResponse.json({ ok:false, message:"Use Supabase Storage via signed URL" }, { status:501 }); }
