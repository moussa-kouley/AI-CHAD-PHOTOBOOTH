import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import QRCode from "qrcode";
import { FGI_POSTER_DATES, FGI_POSTER_DATES_BOX, FGI_POSTER_HOLE } from "./fgi-poster-box";

const POSTER_FILE = path.join(process.cwd(), "public/brand/fgi-poster.jpg");
const TARGET_H = 2400;
const INSET = 0.0035;

function editionPlate(width: number, height: number) {
  const x = Math.round(FGI_POSTER_DATES_BOX.left * width);
  const y = Math.round((FGI_POSTER_DATES_BOX.top + 0.011) * height);
  const size = Math.max(16, Math.round(width * 0.022));
  const tracking = Math.round(size * 0.12);
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="${x}" y="${y}" fill="#f4f8ff" font-size="${size}" letter-spacing="${tracking}" font-family="Helvetica, Arial, sans-serif">${FGI_POSTER_DATES}</text>
    </svg>`);
}

export async function composeFgiPoster(photo: Buffer, shareUrl?: string) {
  const sheet = sharp(await readFile(POSTER_FILE));
  const meta = await sheet.metadata();
  const srcW = Math.max(1, meta.width || 812);
  const srcH = Math.max(1, meta.height || 1024);
  const scale = TARGET_H / srcH;
  const width = Math.round(srcW * scale);
  const height = TARGET_H;
  const poster = await sheet
    .resize(width, height, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();

  const left = Math.round((FGI_POSTER_HOLE.left + INSET) * width);
  const top = Math.round((FGI_POSTER_HOLE.top + INSET) * height);
  const holeW = Math.max(8, Math.round((FGI_POSTER_HOLE.width - INSET * 2) * width));
  const holeH = Math.max(8, Math.round((FGI_POSTER_HOLE.height - INSET * 2) * height));

  const guest = await sharp(photo)
    .rotate()
    .resize(holeW, holeH, {
      fit: "cover",
      position: "attention",
      kernel: sharp.kernel.lanczos3,
    })
    .jpeg({ quality: 94 })
    .toBuffer();

  const layers: sharp.OverlayOptions[] = [
    { input: guest, left, top },
    { input: editionPlate(width, height), left: 0, top: 0 },
  ];
  if (shareUrl) {
    const qrSize = Math.round(Math.min(holeW, holeH) * 0.13);
    const qr = await QRCode.toBuffer(shareUrl, {
      width: qrSize,
      margin: 1,
      color: { dark: "#000b24", light: "#ffffff" },
    });
    const pad = Math.round(Math.min(holeW, holeH) * 0.028);
    layers.push({
      input: qr,
      left: left + holeW - qrSize - pad,
      top: top + holeH - qrSize - pad,
    });
  }

  return sharp(poster)
    .composite(layers)
    .jpeg({ quality: 96, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
}
