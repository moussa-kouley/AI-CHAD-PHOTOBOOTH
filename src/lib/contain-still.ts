import sharp from "sharp";

const CHARCOAL = { r: 16, g: 16, b: 16, alpha: 1 };

function paperRgb(paper?: string) {
  const raw = (paper || "").trim().replace(/^#/, "");
  const hex = raw.length === 3 ? raw.split("").map((ch) => `${ch}${ch}`).join("") : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return CHARCOAL;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
    alpha: 1,
  };
}

/** Contain a still into the target at compose time. Padding lives here, not in the stored original. */
export async function containStill(input: Buffer, width: number, height: number, paper?: string) {
  const background = paperRgb(paper);
  return sharp(input)
    .rotate()
    .resize(width, height, {
      fit: "contain",
      position: "centre",
      background,
      kernel: sharp.kernel.lanczos3,
    })
    .flatten({ background })
    .jpeg({ quality: 94 })
    .toBuffer();
}
