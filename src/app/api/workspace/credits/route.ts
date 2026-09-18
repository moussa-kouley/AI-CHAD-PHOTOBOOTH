import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/errors";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    rateLimit(`credits:${clientIp(request)}`, 8);
    const session = await requireSession();
    const workspace = await prisma.$transaction(async (tx) => {
      const updated = await tx.workspace.update({
        where: { id: session.workspaceId },
        data: { credits: { increment: 25 } },
      });
      await tx.creditLedger.create({
        data: { workspaceId: session.workspaceId, delta: 25, reason: "event_pack" },
      });
      return updated;
    });
    return Response.json({ credits: workspace.credits });
  } catch (error) {
    return jsonError(error);
  }
}
