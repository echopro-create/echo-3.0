"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function pingPulse() {
  const supabase = await createClient();
  await supabase.rpc("pulse_ping");
  revalidatePath("/account");
}

export async function setPulseTtl(formData: FormData) {
  const ttlStr = String(formData.get("ttl_days") ?? "");
  const ttl = Number.parseInt(ttlStr, 10);
  if (!Number.isFinite(ttl)) return;

  const supabase = await createClient();
  await supabase.rpc("pulse_set_ttl", { new_ttl: ttl });
  revalidatePath("/account");
}
