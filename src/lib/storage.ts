import { randomUUID } from "crypto";
import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { AppError } from "./errors";
import { apiCopy } from "./studio-copy";
import { logger } from "./logger";
import { preserveGuestUpload } from "./guest-still";
import { mediaBucket, supabaseAdmin } from "./supabase-admin";

const root = path.join(process.cwd(), "storage");
const MAX_UPLOAD_BYTES = 24 * 1024 * 1024;

const allowed = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function mimeForExt(ext: string) {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "mp4") return "video/mp4";
  return "image/jpeg";
}

async function putCloud(relative: string, buffer: Buffer, mime: string) {
  try {
    const supabase = supabaseAdmin();
    if (!supabase) return false;
    const { error } = await supabase.storage.from(mediaBucket()).upload(relative, buffer, {
      contentType: mime,
      upsert: true,
    });
    if (error) {
      logger.warn({ relative, message: error.message }, "Cloud upload skipped, using local storage");
      return false;
    }
    return true;
  } catch (error) {
    logger.warn({ relative, error }, "Cloud upload skipped, using local storage");
    return false;
  }
}

async function getCloud(relative: string) {
  const supabase = supabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(mediaBucket()).download(relative);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

async function persistFile(relative: string, buffer: Buffer, mime: string) {
  const full = resolveStored(relative);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, buffer);
  void putCloud(relative, buffer, mime);
  return full;
}

export async function saveUpload(file: File, folder: "uploads" | "outputs") {
  const type = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (!allowed.has(type)) {
    throw new AppError(400, apiCopy.jpegOnly, "INVALID_FILE");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new AppError(400, apiCopy.fileTooLarge, "FILE_TOO_LARGE");
  }

  const kept = await preserveGuestUpload(Buffer.from(await file.arrayBuffer()), type || "image/jpeg");
  const ext = kept.mime === "image/png" ? "png" : kept.mime === "image/webp" ? "webp" : "jpg";
  const name = `${randomUUID()}.${ext}`;
  const relative = `${folder}/${name}`;
  const full = await persistFile(relative, kept.buffer, kept.mime);
  return { relative, full, mime: kept.mime, bytes: kept.buffer.length };
}

export async function saveBuffer(buffer: Buffer, folder: "uploads" | "outputs", ext: "png" | "jpg" | "webp" | "mp4") {
  const name = `${randomUUID()}.${ext}`;
  const relative = `${folder}/${name}`;
  const mime = mimeForExt(ext);
  const full = await persistFile(relative, buffer, mime);
  return { relative, full };
}

export function resolveStored(relative: string) {
  const normalized = path.normalize(relative).replace(/^(\.\.(\/|\\|$))+/, "");
  const full = path.join(root, normalized);
  if (!full.startsWith(root)) throw new AppError(400, apiCopy.badPath, "BAD_PATH");
  return full;
}

export async function readStored(relative: string) {
  try {
    return await readFile(resolveStored(relative));
  } catch {
    const cloud = await getCloud(relative);
    if (cloud) return cloud;
    throw new AppError(404, apiCopy.badPath, "MISSING_FILE");
  }
}

export async function storedDataUrl(relative: string) {
  const buffer = await readStored(relative);
  const ext = path.extname(relative).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".mp4" ? "video/mp4" : "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export function publicMediaUrl(relative: string | null | undefined) {
  if (!relative) return null;
  return `/api/media/${relative}`;
}
