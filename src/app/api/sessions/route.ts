import { AppError, jsonError } from "@/lib/errors";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { guestSessionSchema } from "@/lib/validators";
import { apiCopy } from "@/lib/studio-copy";
import { createEventGuestSession } from "@/lib/event-guest";

export const maxDuration = 180;

function parsePromptIds(form: FormData) {
  const raw = form.get("promptIds");
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((item) => typeof item === "string");
    } catch {
      return raw.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  const single = form.get("promptId");
  return typeof single === "string" && single ? [single] : [];
}

export async function POST(request: Request) {
  try {
    rateLimit(`session:${clientIp(request)}`, 120);
    const form = await request.formData();
    const promptIds = parsePromptIds(form);
    const parsed = guestSessionSchema.parse({
      boothToken: form.get("boothToken"),
      promptIds,
      promptId: promptIds[0],
      wantVideo: form.get("wantVideo") === "true",
      consent: form.get("consent") === "true",
      email: form.get("email") || undefined,
      offlineId: form.get("offlineId") || undefined,
    });

    const file = form.get("photo");
    if (!(file instanceof File)) throw new AppError(400, apiCopy.photoRequired, "NO_PHOTO");

    const session = await createEventGuestSession({
      photo: file,
      promptIds: parsed.promptIds?.length ? parsed.promptIds : parsed.promptId ? [parsed.promptId] : [],
      email: parsed.email,
      offlineId: parsed.offlineId,
      boothToken: parsed.boothToken,
    });
    return Response.json({ session });
  } catch (error) {
    return jsonError(error);
  }
}
