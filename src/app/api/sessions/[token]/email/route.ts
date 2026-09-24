import { z } from "zod";
import { AppError, jsonError } from "@/lib/errors";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { apiCopy } from "@/lib/studio-copy";
import { SOCIAL_FILENAME } from "@/lib/social";
import { readEventSession } from "@/lib/event-guest";

const schema = z.object({
  email: z.string().email(apiCopy.invalidEmail).max(120),
});

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    rateLimit(`email:${clientIp(request)}`, 10);
    const { token } = await params;
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase();
    const local = await readEventSession(token);
    if (!local) throw new AppError(404, apiCopy.sessionNotFound, "NOT_FOUND");
    const photo = local.generations.find((item) => item.kind === "photo" && (item.brandedPath || item.outputPath));
    const still = photo?.brandedPath || photo?.outputPath || null;
    const shareUrl = `${env.APP_URL}/s/${token}`;
    const imageUrl = still ? `${env.APP_URL}/api/media/${still}?download=1&name=${SOCIAL_FILENAME}` : shareUrl;
    const subject = encodeURIComponent(apiCopy.mailSubject);
    const mailBody = encodeURIComponent(apiCopy.mailBody(shareUrl, imageUrl));
    return Response.json({
      ok: true,
      mailto: `mailto:${email}?subject=${subject}&body=${mailBody}`,
      shareUrl,
      imageUrl,
      filename: SOCIAL_FILENAME,
    });
  } catch (error) {
    return jsonError(error);
  }
}
