import { prisma } from "./db";
import { logger } from "./logger";
import { generateAiPhoto, generateAiVideo, downloadProviderFile } from "./alibaba";
import { composeBrandedStill, parseBrand } from "./branding";
import { readStored, saveBuffer } from "./storage";
import { sceneDataUrl, toPortraitStill, wanWorkingCopy } from "./scene-ref";
import { env } from "./env";
import { refundCredits } from "./credits";
import { AppError } from "./errors";
import { apiCopy } from "./studio-copy";

const backoff = [15, 30, 60, 120, 240];
const PHOTO_CONCURRENCY = 3;
const wanCanvasByPath = new Map<string, Promise<string>>();
let photoInflight = 0;
const photoWaiters: Array<() => void> = [];

type JobRow = {
  id: string;
  type: string;
  sessionId: string;
  attempts: number;
  maxAttempts: number;
  session: {
    booth: { workspaceId: string };
    generations: Array<{ id: string; kind: string; creditsUsed: number }>;
  };
};

function acquirePhotoSlot() {
  return new Promise<void>((resolve) => {
    if (photoInflight < PHOTO_CONCURRENCY) {
      photoInflight += 1;
      resolve();
      return;
    }
    photoWaiters.push(resolve);
  });
}

function releasePhotoSlot() {
  const next = photoWaiters.shift();
  if (next) next();
  else photoInflight = Math.max(0, photoInflight - 1);
}

async function withPhotoSlot<T>(fn: () => Promise<T>) {
  await acquirePhotoSlot();
  try {
    return await fn();
  } finally {
    releasePhotoSlot();
  }
}

function guestCanvas(relative: string) {
  let hit = wanCanvasByPath.get(relative);
  if (!hit) {
    hit = readStored(relative)
      .then(wanWorkingCopy)
      .catch((error) => {
        wanCanvasByPath.delete(relative);
        throw error;
      });
    wanCanvasByPath.set(relative, hit);
    if (wanCanvasByPath.size > 24) {
      const oldest = wanCanvasByPath.keys().next().value;
      if (oldest && oldest !== relative) wanCanvasByPath.delete(oldest);
    }
  }
  return hit;
}

export async function enqueueJob(sessionId: string, type: "photo" | "video", payload: Record<string, unknown>) {
  return prisma.job.create({
    data: {
      sessionId,
      type,
      payload: JSON.stringify(payload),
      status: "pending",
    },
  });
}

export async function processDueJobs(limit = 6) {
  const jobs = await prisma.job.findMany({
    where: { status: { in: ["pending", "retry"] }, runAfter: { lte: new Date() } },
    include: { session: { include: { booth: true, generations: true } } },
    orderBy: { createdAt: "asc" },
    take: 16,
  });

  const photos = jobs.filter((job) => job.type === "photo").slice(0, limit);
  const videos = jobs.filter((job) => job.type === "video").slice(0, 2);
  if (photos.length || videos.length) {
    logger.info({ photos: photos.length, videos: videos.length, photoIds: photos.map((job) => job.id) }, "Dispatching generation jobs");
  }
  await Promise.all([...photos, ...videos].map((job) => settleJob(job)));
}

async function claimJob(id: string) {
  const result = await prisma.job.updateMany({
    where: { id, status: { in: ["pending", "retry"] } },
    data: { status: "running", attempts: { increment: 1 } },
  });
  return result.count === 1;
}

async function settleJob(job: JobRow) {
  if (job.type === "video") {
    const ready = await prisma.generation.findFirst({
      where: { sessionId: job.sessionId, kind: "photo", status: "ready" },
    });
    if (!ready) {
      const pending = await prisma.generation.findFirst({
        where: { sessionId: job.sessionId, kind: "photo", status: { in: ["queued", "running"] } },
      });
      if (pending) {
        await prisma.job.update({
          where: { id: job.id },
          data: { runAfter: new Date(Date.now() + 1000) },
        });
        return;
      }
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "failed", lastError: apiCopy.photoFailed },
      });
      const video = job.session.generations.find((item) => item.kind === "video");
      if (video) {
        await prisma.generation.update({
          where: { id: video.id },
          data: { status: "failed", error: apiCopy.photoFailed },
        });
        await refundCredits(job.session.booth.workspaceId, video.creditsUsed, "refund_failed_job", video.id);
      }
      return;
    }
  }

  if (!(await claimJob(job.id))) return;

  try {
    await runJob(job.id);
    await prisma.job.update({ where: { id: job.id }, data: { status: "succeeded", lastError: null } });
  } catch (error) {
    const message = error instanceof Error ? error.message : apiCopy.jobFailed;
    const attempts = job.attempts + 1;
    const permanent = error instanceof AppError && (error.code === "MODEL_UNPURCHASED" || error.code === "INVALID_API_KEY");
    const retry = !permanent && attempts < job.maxAttempts;
    logger.error({ jobId: job.id, attempts, message }, "Generation job failed");
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: retry ? "retry" : "failed",
        lastError: message,
        runAfter: new Date(Date.now() + (backoff[attempts - 1] || 300) * 1000),
      },
    });
    if (!retry) {
      const generation = job.session.generations.find((item) => item.kind === job.type);
      if (generation) {
        await prisma.generation.update({
          where: { id: generation.id },
          data: { status: "failed", error: message },
        });
        await refundCredits(job.session.booth.workspaceId, generation.creditsUsed, "refund_failed_job", generation.id);
      }
    }
  }
}

async function kickSessionVideo(sessionId: string) {
  const jobs = await prisma.job.findMany({
    where: { sessionId, type: "video", status: { in: ["pending", "retry"] } },
    include: { session: { include: { booth: true, generations: true } } },
  });
  await Promise.all(jobs.map((job) => settleJob(job)));
}

async function runJob(jobId: string) {
  const job = await prisma.job.findUniqueOrThrow({
    where: { id: jobId },
    include: { session: { include: { booth: true, generations: true } } },
  });
  const payload = JSON.parse(job.payload) as {
    generationId: string;
    prompt: string;
    videoHint?: string;
    publicImageUrl: string;
    themeTitle?: string;
  };
  const generation = await prisma.generation.findUniqueOrThrow({ where: { id: payload.generationId } });
  await prisma.generation.update({ where: { id: generation.id }, data: { status: "running" } });
  logger.info({ jobId, type: job.type, sessionId: job.sessionId }, "Generation job running");

  if (job.type === "photo") {
    const sourcePath = generation.inputPath;
    if (!sourcePath) throw new Error(apiCopy.missingSource);
    const guest = await guestCanvas(sourcePath);
    const scene = await sceneDataUrl(payload.themeTitle || generation.promptTitle);
    const result = await withPhotoSlot(() => generateAiPhoto(guest, payload.prompt, scene));
    let outputPath = sourcePath;
    if (result.mode === "alibaba") {
      const file = await downloadProviderFile(result.url);
      outputPath = (await saveBuffer(await toPortraitStill(file), "outputs", "jpg")).relative;
    }
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "ready", outputPath, brandedPath: null, error: null },
    });
    await prisma.session.update({ where: { id: job.sessionId }, data: { status: "photo_ready" } });
    void kickSessionVideo(job.sessionId);
    await stampOnePrint(job.sessionId, generation.id);
    return;
  }

  const photo = await prisma.generation.findFirst({
    where: { sessionId: job.sessionId, kind: "photo", status: "ready", outputPath: { not: null } },
    orderBy: { createdAt: "asc" },
  });
  const stillPath = photo?.outputPath || generation.inputPath;
  const stillUrl = stillPath ? await guestCanvas(stillPath) : payload.publicImageUrl;
  const result = await generateAiVideo(stillUrl, payload.videoHint || payload.prompt);
  if (result.mode === "demo") {
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "ready", outputPath: photo?.outputPath, error: apiCopy.demoFilm },
    });
    return;
  }
  const file = await downloadProviderFile(result.url);
  const saved = await saveBuffer(file, "outputs", "mp4");
  await prisma.generation.update({
    where: { id: generation.id },
    data: { status: "ready", outputPath: saved.relative, error: null },
  });
  await prisma.session.update({ where: { id: job.sessionId }, data: { status: "complete" } });
}

export async function stampOnePrint(sessionId: string, generationId: string) {
  const session = await prisma.session.findUniqueOrThrow({
    where: { id: sessionId },
    include: { booth: true, generations: true },
  });
  const brand = parseBrand(session.booth.brand);
  const shareUrl = `${env.APP_URL}/s/${session.shareToken}`;
  const generation = session.generations.find((item) => item.id === generationId);
  if (!generation?.outputPath) return;
  const buffer = await readStored(generation.outputPath);
  const branded = await composeBrandedStill(buffer, brand, shareUrl, {
    themeTitle: generation.promptTitle,
  });
  const brandedPath = (await saveBuffer(branded, "outputs", "jpg")).relative;
  await prisma.generation.update({ where: { id: generation.id }, data: { brandedPath } });
}

export async function stampSessionPrints(sessionId: string) {
  const session = await prisma.session.findUniqueOrThrow({
    where: { id: sessionId },
    include: { booth: true, generations: true },
  });
  const photos = session.generations.filter((item) => item.kind === "photo" && item.status === "ready" && item.outputPath);
  await Promise.all(photos.map((generation) => stampOnePrint(sessionId, generation.id)));
}

export async function stampBoothPrints(boothId: string, limit = 8) {
  const sessions = await prisma.session.findMany({
    where: { boothId, generations: { some: { kind: "photo", status: "ready", outputPath: { not: null } } } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true },
  });
  await Promise.all(sessions.map((session) => stampSessionPrints(session.id)));
}
