import sharp from "sharp";

/**
 * Identity-safe encode for AI output only. No beauty filter, no booth grade, no face morph.
 * Do not run this on the guest original.
 */
export async function polishStill(input: Buffer, _mode: "booth" | "finish" = "finish") {
  const image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const longEdge = Math.max(meta.width || 0, meta.height || 0);
  const pipeline =
    longEdge > 4096
      ? image.clone().resize(4096, 4096, { fit: "inside", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
      : image.clone();
  return pipeline.jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
}
