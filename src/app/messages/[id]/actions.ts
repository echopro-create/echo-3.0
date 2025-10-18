"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function rescheduleMessage(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const when = String(formData.get("send_at") ?? "");

  if (!id || !when) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const dt = new Date(when);
  if (Number.isNaN(dt.getTime())) return;

  // Обновляем только свои и только те, что еще в расписании
  await supabase
    .from("messages")
    .update({ send_at: dt.toISOString(), status: "scheduled" })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "scheduled");

  revalidatePath("/messages");
  revalidatePath(`/messages/${id}`);
}

export async function cancelMessage(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("messages")
    .update({ status: "canceled" })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "scheduled");

  revalidatePath("/messages");
  revalidatePath(`/messages/${id}`);
}
