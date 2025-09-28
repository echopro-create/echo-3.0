import { NextResponse } from "next/server";
export async function POST(){
  // TODO: upload to Supabase Storage, return signed URL
  return NextResponse.json({ url: null });
}
