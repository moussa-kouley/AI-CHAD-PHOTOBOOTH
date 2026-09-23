import { nanoid } from "nanoid";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { guestSessionSchema } from "@/lib/validators";
import { AppError, jsonError } from "@/lib/errors";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { saveUpload } from "@/lib/storage";
import { creditCost, spendCredits } from "@/lib/credits";
import { enqueueJob, processDueJobs } from "@/lib/jobs";
import { env } from "@/lib/env";
import { serializeSession } from "@/lib/session-dto";
import { apiCopy } from "@/lib/studio-copy";
import { ensureEventBooth } from "@/lib/event-booth";
import { EVENT_PUBLIC_TOKEN } from "@/lib/fgi-agenda";
import { ensureSystemPrompts } from "@/lib/prompt-sync";

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

async function resolveLooks(ids: string[]) {
  const unique = ids.map((item) => item.trim()).filter(Boolean);
  if (!unique.length) return [];
  const match = (rows: Awaited<ReturnType<typeof prisma.prompt.findMany>>) =>
    unique
      .map((id) => rows.find((row) => row.id === id || row.title.toLowerCase() === id.toLowerCase()))
      .filter((row): row is (typeof rows)[number] => Boolean(row));

  let rows = await prisma.prompt.findMany({
    where: { OR: [{ id: { in: unique } }, { title: { in: unique } }] },
  });
  let ordered = match(rows);
  if (ordered.length) return ordered;

  await ensureSystemPrompts();
  rows = await prisma.prompt.findMany({
    where: { OR: [{ id: { in: unique } }, { title: { in: unique } }] },
  });
  return match(rows);
}

export async function POST(request: Request) {
  try {
    rateLimit(`session:${clientIp(request)}`, 20);
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

    if (parsed.boothToken === EVENT_PUBLIC_TOKEN) {
      await ensureEventBooth();
    }
    const booth = await prisma.photobooth.findUnique({ where: { publicToken: parsed.boothToken } });
    if (!booth || !booth.isActive) throw new AppError(404, apiCopy.boothUnavailable, "BOOTH_OFFLINE");

    if (parsed.offlineId) {
      const replay = await prisma.session.findUnique({
        where: { offlineId: parsed.offlineId },
        include: { generations: true, booth: true },
      });
      if (replay) {
        return Response.json({ session: serializeSession(replay) });
      }
    }

    const ids = [...new Set(parsed.promptIds?.length ? parsed.promptIds : parsed.promptId ? [parsed.promptId] : [])].slice(0, 3);
    const ordered = await resolveLooks(ids);
    if (!ordered.length) throw new AppError(400, apiCopy.unknownStyle, "BAD_PROMPT");

    const upload = await saveUpload(file, "uploads");
    const publicImageUrl = `${env.APP_URL}/api/media/${upload.relative}`;
    const wantVideo = parsed.wantVideo && booth.videoEnabled;
    const photoCost = creditCost("photo") * ordered.length;
    const videoCost = wantVideo ? creditCost("video") : 0;
    await spendCredits(booth.workspaceId, photoCost + videoCost, "session_reserve");

    const session = await prisma.session.create({
      data: {
        boothId: booth.id,
        shareToken: nanoid(18),
        consent: true,
        email: parsed.email || null,
        sourcePath: upload.relative,
        offlineId: parsed.offlineId,
        status: "queued",
      },
    });

    for (const [index, prompt] of ordered.entries()) {
      const photoGen = await prisma.generation.create({
        data: {
          boothId: booth.id,
          sessionId: session.id,
          kind: "photo",
          status: "queued",
          promptTitle: prompt.title,
          promptBody: prompt.body,
          inputPath: upload.relative,
          creditsUsed: creditCost("photo"),
        },
      });
      await enqueueJob(session.id, "photo", {
        generationId: photoGen.id,
        prompt: prompt.body,
        videoHint: prompt.videoHint,
        publicImageUrl,
        themeTitle: prompt.title,
      });

      if (wantVideo && index === 0) {
        const videoGen = await prisma.generation.create({
          data: {
            boothId: booth.id,
            sessionId: session.id,
            kind: "video",
            status: "queued",
            promptTitle: prompt.title,
            promptBody: prompt.videoHint,
            inputPath: upload.relative,
            creditsUsed: videoCost,
          },
        });
        await enqueueJob(session.id, "video", {
          generationId: videoGen.id,
          prompt: prompt.body,
          videoHint: prompt.videoHint,
          publicImageUrl,
        });
      }
    }

    after(() => processDueJobs(6));

    const full = await prisma.session.findUniqueOrThrow({
      where: { id: session.id },
      include: { generations: true, booth: true },
    });
    return Response.json({ session: serializeSession(full) });
  } catch (error) {
    return jsonError(error);
  }
}
