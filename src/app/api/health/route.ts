import { prisma } from "@/lib/db";
import { hasAlibabaCredentials } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const pending = await prisma.job.count({ where: { status: { in: ["pending", "retry", "running"] } } });
    return Response.json({
      ok: true,
      db: "up",
      provider: hasAlibabaCredentials() ? "alibaba" : "demo",
      pendingJobs: pending,
    });
  } catch {
    return Response.json({ ok: false, db: "down" }, { status: 503 });
  }
}
