import { createSupabaseServerClient } from "@/lib/supabase.server";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminIndex() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const uid = data?.user?.id || null;

  const whitelist = (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const allowed = !!(uid && whitelist.includes(uid));

  return (
    <div className="container py-6" style={{ maxWidth: 720 }}>
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="card mt-4">
        <div className="text-sm">uid: <code>{uid ?? "—"}</code></div>
        <div className="text-sm">whitelist: <code>{whitelist.join(",") || "—"}</code></div>
        <div className="text-sm">allowed: {String(allowed)}</div>
      </div>

      <div className="card mt-4">
        <ul className="list-disc pl-5 text-sm">
          <li><Link href="/admin/usage" className="underline">Storage usage</Link></li>
        </ul>
      </div>
    </div>
  );
}
