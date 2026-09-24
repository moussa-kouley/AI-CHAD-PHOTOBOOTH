import { mkdir, readdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { generateAiPhoto, downloadProviderFile } from "./alibaba";
import { composeBrandedStill, parseBrand } from "./branding";
import { env } from "./env";
import { AppError } from "./errors";
import { EVENT_PUBLIC_TOKEN } from "./fgi-agenda";
import { logger } from "./logger";
import { resolveLooksLocal } from "./looks";
import { mediaBucket, supabaseAdmin } from "./supabase-admin";
import { readStored, saveBuffer, saveUpload } from "./storage";
import { sceneDataUrl, toPortraitStill, wanWorkingCopy } from "./scene-ref";
import { serializeSession } from "./session-dto";
import { apiCopy } from "./studio-copy";

const EVENT_BRAND = parseBrand(
  JSON.stringify({
    frame: "poster",
    eventName: "FGI Tchad",
    subtitle: "10e édition · N’Djamena",
    primary: "#FECB00",
    showTitle: true,
  }),
);

const root = path.join(process.cwd(), "storage", "sessions");

export type EventGeneration = {
  id: string;
  kind: "photo";
  status: string;
  promptTitle: string;
  promptBody: string;
  inputPath: string | null;
  outputPath: string | null;
  brandedPath: string | null;
  error: string | null;
};

export type EventSessionRecord = {
  id: string;
  shareToken: string;
  status: string;
  email: string | null;
  sourcePath: string | null;
  offlineId: string | null;
  booth: { publicToken: string };
  generations: EventGeneration[];
};

function sessionFile(token: string) {
  return path.join(root, `${token}.json`);
}

function offlineFile(offlineId: string) {
  return path.join(root, "offline", `${offlineId}.json`);
}

async function writeJson(file: string, data: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${nanoid(6)}.tmp`;
  await writeFile(tmp, JSON.stringify(data));
  await rename(tmp, file);
}

async function readCloudSession(token: string): Promise<EventSessionRecord | null> {
  try {
    const supabase = supabaseAdmin();
    if (!supabase) return null;
    const { data, error } = await supabase.storage.from(mediaBucket()).download(`sessions/${token}.json`);
    if (error || !data) return null;
    return JSON.parse(await data.text()) as EventSessionRecord;
  } catch {
    return null;
  }
}

function putCloudSession(record: EventSessionRecord) {
  const supabase = supabaseAdmin();
  if (!supabase) return;
  const body = Buffer.from(JSON.stringify(record));
  void supabase.storage.from(mediaBucket()).upload(`sessions/${record.shareToken}.json`, body, {
    contentType: "application/json",
    upsert: true,
  });
}

export async function readEventSession(token: string): Promise<EventSessionRecord | null> {
  try {
    const raw = await readFile(sessionFile(token), "utf8");
    return JSON.parse(raw) as EventSessionRecord;
  } catch {
    return readCloudSession(token);
  }
}

export async function readEventSessionByOfflineId(offlineId: string): Promise<EventSessionRecord | null> {
  try {
    const pointer = JSON.parse(await readFile(offlineFile(offlineId), "utf8")) as { shareToken?: string };
    if (!pointer.shareToken) return null;
    return readEventSession(pointer.shareToken);
  } catch {
    return null;
  }
}

async function persist(record: EventSessionRecord) {
  await writeJson(sessionFile(record.shareToken), record);
  putCloudSession(record);
  if (record.offlineId) {
    await writeJson(offlineFile(record.offlineId), { shareToken: record.shareToken });
  }
}

async function transformLook(
  look: { title: string; body: string },
  sourcePath: string,
  shareToken: string,
  generationId: string,
) {
  const guest = await wanWorkingCopy(await readStored(sourcePath));
  const scene = await sceneDataUrl(look.title);
  const posterFill =
    " This print fills the official FGI Tchad 10e édition poster window. Same guest, same face, same skin. Waist-up, large, filling the photograph. Futuristic place behind them. No extra people if they came alone. No logos. No text.";
  const result = await generateAiPhoto(guest, `${look.body} ${posterFill}`, scene);
  let outputPath = sourcePath;
  if (result.mode === "alibaba") {
    const file = await downloadProviderFile(result.url);
    outputPath = (await saveBuffer(await toPortraitStill(file), "outputs", "jpg")).relative;
  }
  const shareUrl = `${env.APP_URL.replace(/\/$/, "")}/s/${shareToken}/keep/${generationId}`;
  const branded = await composeBrandedStill(await readStored(outputPath), EVENT_BRAND, shareUrl, {
    themeTitle: look.title,
  });
  const brandedPath = (await saveBuffer(branded, "outputs", "jpg")).relative;
  return { outputPath, brandedPath };
}

export async function createEventGuestSession(input: {
  photo: File;
  promptIds: string[];
  email?: string;
  offlineId?: string;
  boothToken?: string;
}) {
  if (input.offlineId) {
    const replay = await readEventSessionByOfflineId(input.offlineId);
    if (replay) return serializeSession(replay);
  }

  const looks = resolveLooksLocal(input.promptIds).slice(0, 3);
  if (!looks.length) throw new AppError(400, apiCopy.unknownStyle, "BAD_PROMPT");

  const upload = await saveUpload(input.photo, "uploads");
  const shareToken = nanoid(18);
  const sessionId = nanoid(16);
  const generations: EventGeneration[] = looks.map((look) => ({
    id: nanoid(16),
    kind: "photo",
    status: "running",
    promptTitle: look.title,
    promptBody: look.body,
    inputPath: upload.relative,
    outputPath: null,
    brandedPath: null,
    error: null,
  }));

  const record: EventSessionRecord = {
    id: sessionId,
    shareToken,
    status: "queued",
    email: input.email || null,
    sourcePath: upload.relative,
    offlineId: input.offlineId || null,
    booth: { publicToken: input.boothToken || EVENT_PUBLIC_TOKEN },
    generations,
  };
  await persist(record);
  logger.info({ shareToken, looks: looks.map((look) => look.title) }, "Event guest transform started");

  for (const [index, look] of looks.entries()) {
    const generation = record.generations[index];
    try {
      const done = await transformLook(look, upload.relative, shareToken, generation.id);
      generation.status = "ready";
      generation.outputPath = done.outputPath;
      generation.brandedPath = done.brandedPath;
      generation.error = null;
      record.status = "photo_ready";
      await persist(record);
    } catch (error) {
      const message = error instanceof Error ? error.message : apiCopy.jobFailed;
      logger.error({ shareToken, look: look.title, message }, "Event guest transform failed");
      generation.status = "failed";
      generation.error = message;
      await persist(record);
    }
  }

  if (record.generations.every((item) => item.status === "failed")) {
    record.status = "failed";
    await persist(record);
    throw new AppError(502, record.generations[0]?.error || apiCopy.jobFailed, "TRANSFORM_FAILED");
  }

  record.status = "complete";
  await persist(record);
  return serializeSession(record);
}

export async function listLocalGallery(boothToken?: string) {
  let names: string[] = [];
  try {
    names = await readdir(root);
  } catch {
    return [];
  }
  const photos: Array<{ id: string; image: string; title: string; sharePath: string; createdAt: number }> = [];
  for (const name of names) {
    if (!name.endsWith(".json")) continue;
    const record = await readEventSession(name.slice(0, -5));
    if (!record) continue;
    if (boothToken && record.booth.publicToken !== boothToken) continue;
    for (const item of record.generations) {
      const still = item.brandedPath || item.outputPath;
      if (item.kind !== "photo" || item.status !== "ready" || !still) continue;
      photos.push({
        id: item.id,
        image: `/api/media/${still}`,
        title: item.promptTitle,
        sharePath: `/s/${record.shareToken}`,
        createdAt: 0,
      });
    }
  }
  return photos;
}

