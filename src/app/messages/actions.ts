"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteMessage(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Удаляем: RLS гарантирует, что можно трогать только своё
  await supabase.from("messages").delete().eq("id", id);
  revalidatePath("/messages");
}
