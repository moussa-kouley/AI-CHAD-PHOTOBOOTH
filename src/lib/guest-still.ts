import sharp from "sharp";

export const GUEST_MAX_EDGE = 4096;
const JPEG_QUALITY = 92;

export type KeptGuestStill = {
  buffer: Buffer;
  mime: "image/jpeg" | "image/png" | "image/webp";
};

function keptMime(mime: string): KeptGuestStill["mime"] {
  if (mime === "image/png") return "image/png";
  if (mime === "image/webp") return "image/webp";
  return "image/jpeg";
}

/** Store the guest file as-is. Bake EXIF rotate and downscale only if the long edge exceeds 4096. */
export async function preserveGuestUpload(buffer: Buffer, mime: string): Promise<KeptGuestStill> {
  const type = keptMime(mime);
  const meta = await sharp(buffer, { failOn: "none" }).metadata();
  const orientation = meta.orientation || 1;
  const width = meta.width || 0;
  const height = meta.height || 0;
  const longEdge = Math.max(width, height);
  const needsRotate = orientation !== 1;
  const needsScale = longEdge > GUEST_MAX_EDGE;
  if (!needsRotate && !needsScale) {
    return { buffer, mime: type };
  }

  let pipeline = sharp(buffer, { failOn: "none" }).rotate();
  if (needsScale) {
    pipeline = pipeline.resize(GUEST_MAX_EDGE, GUEST_MAX_EDGE, {
      fit: "inside",
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    });
  }

  if (type === "image/png") {
    return { buffer: await pipeline.png({ compressionLevel: 6 }).toBuffer(), mime: "image/png" };
  }
  if (type === "image/webp") {
    return { buffer: await pipeline.webp({ quality: JPEG_QUALITY }).toBuffer(), mime: "image/webp" };
  }
  return {
    buffer: await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer(),
    mime: "image/jpeg",
  };
}
