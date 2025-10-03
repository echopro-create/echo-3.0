// app/s/[token]/page.tsx
import PublicShareClient from "./Client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = Promise<{ token: string }>;

export default async function Page(props: { params: Params }) {
  const { token } = await props.params; // Next 15 отдаёт params как промис
  return <PublicShareClient token={token} />;
}
