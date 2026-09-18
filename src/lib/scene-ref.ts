import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { themeLook } from "./theme-look";

/** Wan working canvas only — never write this over the stored original. */
export const WAN_W = 720;
export const WAN_H = 1280;
const PAD = { r: 16, g: 16, b: 16, alpha: 1 };
const sceneCache = new Map<string, Promise<string | null>>();

async function containPad(input: Buffer, width: number, height: number, quality = 82) {
  // API working copy only — session.sourcePath stays the guest file.
  return sharp(input)
    .rotate()
    .resize(width, height, {
      fit: "contain",
      position: "centre",
      background: PAD,
      kernel: sharp.kernel.cubic,
    })
    .flatten({ background: PAD })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
}

/** Smaller JPEG for the model API. Pad/downscale here, not in storage. */
export async function wanWorkingCopy(input: Buffer) {
  if (input.length < 4000) {
    throw new Error("Guest photo is too small to send to Wan");
  }
  const jpeg = await containPad(input, WAN_W, WAN_H, 82);
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

export async function sceneDataUrl(title: string) {
  const cached = sceneCache.get(title);
  if (cached) return cached;
  const pending = loadScene(title);
  sceneCache.set(title, pending);
  return pending;
}

async function loadScene(title: string) {
  const look = themeLook(title);
  if (!look.cover || look.plate === false) return null;
  const full = path.join(process.cwd(), "public", look.cover.replace(/^\//, ""));
  try {
    const raw = await readFile(full);
    const jpeg = await containPad(raw, WAN_W, WAN_H, 80);
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Padded Wan working copy from a data URL. Never write this over the stored original. */
export async function asJpegDataUrl(source: string) {
  if (!source.startsWith("data:image")) return source;
  const raw = Buffer.from(source.split(",")[1] || "", "base64");
  return wanWorkingCopy(raw);
}

/** Encode an AI result. Does not replace the guest original. No grade, no 4:5 crop. */
export async function toPortraitStill(input: Buffer) {
  const image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const longEdge = Math.max(meta.width || 0, meta.height || 0);
  const pipeline =
    longEdge > 4096
      ? image.clone().resize(4096, 4096, { fit: "inside", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
      : image.clone();
  return pipeline.jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
}
