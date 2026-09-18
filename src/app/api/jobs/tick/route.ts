import { processDueJobs } from "@/lib/jobs";
import { AppError, jsonError } from "@/lib/errors";
import { env } from "@/lib/env";
import { apiCopy } from "@/lib/studio-copy";

export async function POST(request: Request) {
  try {
    if (env.CRON_SECRET) {
      const auth = request.headers.get("authorization");
      if (auth !== `Bearer ${env.CRON_SECRET}`) {
        throw new AppError(401, apiCopy.unauthorizedWorker, "UNAUTHENTICATED");
      }
    }
    await processDueJobs(6);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
