import { after } from "next/server";
import { prisma } from "@/lib/db";
import { AppError, jsonError } from "@/lib/errors";
import { serializeSession } from "@/lib/session-dto";
import { processDueJobs } from "@/lib/jobs";
import { apiCopy } from "@/lib/studio-copy";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const session = await prisma.session.findUnique({
      where: { shareToken: token },
      include: { generations: true, booth: true },
    });
    if (!session) throw new AppError(404, apiCopy.sessionExpired, "NOT_FOUND");
    if (session.generations.some((item) => item.status === "queued" || item.status === "running")) {
      after(() => processDueJobs(6));
    }
    return Response.json({ session: serializeSession(session) });
  } catch (error) {
    return jsonError(error);
  }
}
