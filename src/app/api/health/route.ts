import { hasAlibabaCredentials } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    db: "off",
    provider: hasAlibabaCredentials() ? "alibaba" : "demo",
    pendingJobs: 0,
  });
}
