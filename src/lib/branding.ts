import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import QRCode from "qrcode";
import { FRAME_ALIASES, type FrameId } from "./frames";
import { type BrandKit } from "./brand-schema";
import { containStill } from "./contain-still";
import { SOCIAL_H, SOCIAL_W } from "./social";
import { BRAND } from "./brand";

export { brandSchema, parseBrand, type BrandKit } from "./brand-schema";

export const FEED_SIZE = SOCIAL_W;
export const LOOK_W = SOCIAL_W;
export const LOOK_H = SOCIAL_H;

export type ComposeExtras = {
  themeTitle?: string;
  original?: Buffer;
  siblings?: Buffer[];
  dateLabel?: string;
};

function hex(color: string) {
  return color.startsWith("#") ? color : `#${color}`;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[ch] || ch);
}

function clip(value: string, max: number) {
  const text = value.trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function resolveFrame(frame: string): FrameId {
  if (frame === "strip" || frame === "sparkle" || frame === "brand" || frame === "instant" || frame === "held") {
    return frame;
  }
  return FRAME_ALIASES[frame] || "strip";
}

function rgb(color: string) {
  const value = hex(color).slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function luminance(color: string) {
  const { r, g, b } = rgb(color);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function inkOn(color: string) {
  return luminance(color) > 0.62 ? "#161412" : "#f6f0e6";
}

function mutedOn(color: string) {
  return luminance(color) > 0.62 ? "#5c564d" : "#c9bba8";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0] || "C"}${parts[1][0] || "A"}`.toUpperCase();
  return (name.trim().slice(0, 2) || "CA").toUpperCase();
}

function dateFolio(extras?: ComposeExtras) {
  return extras?.dateLabel || new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

async function prepareMark(raw: Buffer) {
  const rotated = sharp(raw).rotate();
  try {
    return await rotated.clone().ensureAlpha().trim({ threshold: 12 }).toBuffer();
  } catch {
    return rotated.toBuffer();
  }
}

async function houseMark(brand: BrandKit, maxW: number, maxH: number, gold: string, paper: string) {
  const size = Math.min(maxW, maxH);
  const dir = path.join(process.cwd(), "public/brand");
  for (const file of ["studio-ia-tchad.svg", "studio-ia-tchad.png"]) {
    try {
      const crest = await readFile(path.join(dir, file));
      return sharp(crest, { density: 288 })
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
          kernel: sharp.kernel.lanczos3,
        })
        .png()
        .toBuffer();
    } catch {
      continue;
    }
  }
  const letters = initials(brand.eventName || brand.signature || BRAND.mark);
  const stroke = Math.max(5, Math.round(size * 0.035));
  return sharp(Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${paper}" stroke="${gold}" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - stroke * 2.6}" fill="none" stroke="${gold}" stroke-width="1.5" opacity="0.7"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="${gold}" font-size="${Math.round(size * 0.32)}" font-family="Georgia, serif">${escapeXml(letters)}</text>
    </svg>`)).png().toBuffer();
}

type PlateMark = {
  input: Buffer;
  width: number;
  height: number;
  bleed: boolean;
};

/** Wide event banners fill the slot width. Crests stay centered and unstretched. */
async function brandMark(brand: BrandKit, width: number, maxH: number, gold: string, paper: string): Promise<PlateMark> {
  const w = Math.max(1, Math.round(width));
  const cap = Math.max(72, Math.round(maxH));
  if (!brand.logoDataUrl?.startsWith("data:image")) {
    const size = Math.min(w, cap, 148);
    const input = await houseMark(brand, size, size, gold, paper);
    const meta = await sharp(input).metadata();
    return { input, width: meta.width || size, height: meta.height || size, bleed: false };
  }
  const raw = Buffer.from(brand.logoDataUrl.split(",")[1] || "", "base64");
  const prepared = await prepareMark(raw);
  const meta = await sharp(prepared).metadata();
  const srcW = Math.max(1, meta.width || w);
  const srcH = Math.max(1, meta.height || cap);
  const ratio = srcW / srcH;
  const wide = ratio >= 1.45;

  if (!wide) {
    const h = Math.min(cap, 148);
    const input = await sharp(prepared)
      .resize(w, h, {
        fit: "contain",
        position: "centre",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        kernel: sharp.kernel.lanczos3,
      })
      .png({ compressionLevel: 4, adaptiveFiltering: true })
      .toBuffer();
    return { input, width: w, height: h, bleed: true };
  }

  const input = await sharp(prepared)
    .resize({ width: w })
    .png({ compressionLevel: 4, adaptiveFiltering: true })
    .toBuffer();
  const out = await sharp(input).metadata();
  return { input, width: out.width || w, height: Math.max(96, out.height || Math.round(w / ratio)), bleed: true };
}

function overlayMark(mark: PlateMark, box: { left: number; top: number; width: number; height: number }): sharp.OverlayOptions {
  if (mark.bleed) return { input: mark.input, left: box.left, top: box.top };
  return {
    input: mark.input,
    left: box.left + Math.round((box.width - mark.width) / 2),
    top: box.top + Math.round((box.height - mark.height) / 2),
  };
}

async function qrPlate(url: string, size: number, light = "#ffffff") {
  const qr = await QRCode.toBuffer(url, { width: size - 10, margin: 0, color: { dark: "#14110d", light } });
  return sharp({
    create: { width: size, height: size, channels: 3, background: rgb(light) },
  })
    .composite([{ input: qr, top: 5, left: 5 }])
    .png()
    .toBuffer();
}

async function finish(layers: sharp.OverlayOptions[], paper: string, width = SOCIAL_W, height = SOCIAL_H) {
  return sharp({
    create: { width, height, channels: 3, background: rgb(paper) },
  })
    .composite(layers)
    .jpeg({ quality: 96, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

type SocialTheme = {
  paper: string;
  plate: string;
  gold: string;
  night?: boolean;
  forum?: boolean;
  polaroid?: boolean;
  salon?: boolean;
};

async function composeSocial(
  input: Buffer,
  brand: BrandKit,
  shareUrl: string | undefined,
  extras: ComposeExtras | undefined,
  theme: SocialTheme,
) {
  const W = SOCIAL_W;
  const H = SOCIAL_H;
  const gold = hex(theme.gold);
  const event = brand.eventName || BRAND.fr;
  const signature = clip(brand.signature || "", 42);
  const showTitle = Boolean(brand.showTitle && event.trim());
  const date = dateFolio(extras);
  const mat = theme.forum ? 28 : 0;
  const fillet = theme.night ? 16 : 0;
  const paperMargin = theme.polaroid ? 36 : theme.salon ? 40 : 0;
  const plateX = mat + fillet;
  const plateW = W - plateX * 2;
  const plateH = H - plateX * 2;
  const contentX = plateX + paperMargin;
  const contentW = plateW - paperMargin * 2;
  const footMark = Boolean(theme.polaroid || theme.salon);
  const footH = theme.polaroid ? 200 : theme.salon ? 168 : 112;
  const maxBannerH = footMark ? Math.max(96, footH - 56) : Math.round(H * 0.38);
  const plate = theme.plate;
  const ink = inkOn(plate);
  const mute = mutedOn(plate);
  const mastPaper = theme.night ? "#f4efe6" : plate;
  const markBoxH = footMark ? maxBannerH : maxBannerH;
  const mark = await brandMark(brand, contentW, markBoxH, gold, mastPaper);
  const minPhoto = 240;
  const maxMast = Math.max(96, plateH - paperMargin * 2 - footH - minPhoto);
  const rawMast = footMark
    ? theme.polaroid
      ? 18
      : 22
    : mark.bleed
      ? mark.height
      : Math.max(120, Math.min(148, mark.height + 20));
  const mastH = Math.min(rawMast, maxMast);
  const photoTop = plateX + paperMargin + mastH;
  const photoH = Math.max(minPhoto, plateH - paperMargin * 2 - mastH - footH);
  const photoW = contentW;
  const footerTop = photoTop + photoH;
  const qrSize = 76;
  const qrPad = 18;
  const photo = await containStill(input, photoW, photoH, plate);
  const plateMark =
    mark.bleed && mark.height > mastH
      ? {
          ...mark,
          input: await sharp(mark.input).resize(contentW, mastH, { fit: "fill" }).toBuffer(),
          width: contentW,
          height: mastH,
        }
      : mark;
  const markTop = footMark ? footerTop + 8 : plateX + paperMargin;
  const markH = footMark ? Math.max(plateMark.height, footH - 56) : mastH;
  const labelX = contentX + 28;
  const dateY = footerTop + footH - (theme.polaroid ? 28 : 38);

  const ground = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${H}" fill="${theme.paper}"/>
      ${theme.forum ? `<rect x="${mat}" y="${mat}" width="${W - mat * 2}" height="${H - mat * 2}" fill="${gold}"/>` : ""}
      <rect x="${plateX}" y="${plateX}" width="${plateW}" height="${plateH}" fill="${plate}"/>
      ${theme.night && !footMark && !mark.bleed ? `<rect x="${contentX}" y="${plateX}" width="${contentW}" height="${mastH}" fill="#f4efe6"/>` : ""}
      ${!theme.night && !theme.forum && !mark.bleed ? `<rect x="${contentX}" y="${plateX}" width="${contentW}" height="3" fill="${gold}"/>` : ""}
      ${theme.forum ? `<rect x="${contentX}" y="${plateX + 4}" width="${contentW}" height="2" fill="#111111"/>` : ""}
      <rect x="${contentX}" y="${footerTop}" width="${contentW}" height="${footH}" fill="${theme.night ? "#121214" : plate}"/>
      ${theme.night ? `<rect x="${contentX}" y="${footerTop}" width="${contentW}" height="1" fill="${gold}" opacity="0.55"/>` : `<rect x="${contentX}" y="${footerTop}" width="${contentW}" height="1" fill="${gold}" opacity="0.35"/>`}
    </svg>`);
  const frameOverlay = theme.night
    ? Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${fillet}" y="${fillet}" width="${W - fillet * 2}" height="${H - fillet * 2}" fill="none" stroke="${gold}" stroke-width="3"/>
      <rect x="${fillet + 10}" y="${fillet + 10}" width="${W - (fillet + 10) * 2}" height="${H - (fillet + 10) * 2}" fill="none" stroke="${gold}" stroke-width="1" opacity="0.4"/>
    </svg>`)
    : null;
  const caption = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      ${showTitle ? `<text x="${labelX}" y="${dateY - (signature ? 36 : 22)}" text-anchor="start" fill="${theme.night ? "#c9bba8" : mute}" font-size="15" letter-spacing="4" font-family="Helvetica, Arial">${escapeXml(clip(event, 36).toUpperCase())}</text>` : ""}
      ${signature ? `<text x="${labelX}" y="${dateY - 18}" text-anchor="start" fill="${theme.night ? "#f4efe6" : ink}" font-size="26" font-style="italic" font-family="Georgia, serif">${escapeXml(signature)}</text>` : ""}
      <text x="${labelX}" y="${dateY}" fill="${theme.night ? "#c9bba8" : mute}" font-size="16" letter-spacing="3" font-family="Helvetica, Arial">${escapeXml(date)}</text>
    </svg>`);

  const layers: sharp.OverlayOptions[] = [
    { input: ground, top: 0, left: 0 },
    overlayMark(plateMark, { left: contentX, top: markTop, width: contentW, height: markH }),
    { input: photo, top: photoTop, left: contentX },
    { input: caption, top: 0, left: 0 },
  ];
  if (shareUrl) {
    layers.push({
      input: await qrPlate(shareUrl, qrSize, theme.night ? "#f4efe6" : "#ffffff"),
      top: footerTop + Math.round((footH - qrSize) / 2),
      left: contentX + contentW - qrSize - qrPad,
    });
  }
  if (frameOverlay) layers.push({ input: frameOverlay, top: 0, left: 0 });
  return finish(layers, theme.paper, W, H);
}

export async function composeBrandedStill(
  input: Buffer,
  brand: BrandKit,
  shareUrl?: string,
  extras?: ComposeExtras,
) {
  const frame = resolveFrame(brand.frame);
  const gold = hex(brand.primary);
  if (frame === "sparkle") {
    return composeSocial(input, brand, shareUrl, extras, {
      paper: "#070708",
      plate: "#0c0c0e",
      gold,
      night: true,
    });
  }
  if (frame === "brand") {
    return composeSocial(input, brand, shareUrl, extras, {
      paper: "#f3eee6",
      plate: "#fffcf7",
      gold,
      forum: true,
    });
  }
  if (frame === "instant") {
    return composeSocial(input, brand, shareUrl, extras, {
      paper: "#f7f3ea",
      plate: "#f7f3ea",
      gold,
      polaroid: true,
    });
  }
  if (frame === "held") {
    return composeSocial(input, brand, shareUrl, extras, {
      paper: "#ebe6db",
      plate: "#ebe6db",
      gold,
      salon: true,
    });
  }
  return composeSocial(input, brand, shareUrl, extras, {
    paper: "#efe8dc",
    plate: "#fbf8f2",
    gold,
  });
}
