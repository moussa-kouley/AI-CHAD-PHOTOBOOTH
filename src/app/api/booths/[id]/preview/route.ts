import sharp from "sharp";
import { requireBoothAccess } from "@/lib/auth";
import { brandSchema, composeBrandedStill, parseBrand } from "@/lib/branding";
import { jsonError } from "@/lib/errors";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { readStored } from "@/lib/storage";

async function syntheticGuest() {
  const svg = Buffer.from(`
    <svg width="1080" height="1350" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="key" cx="50%" cy="30%" r="48%">
          <stop offset="0%" stop-color="#f0d4b0"/>
          <stop offset="42%" stop-color="#c49a72"/>
          <stop offset="100%" stop-color="#1c1410"/>
        </radialGradient>
      </defs>
      <rect width="1080" height="1350" fill="#120e0c"/>
      <rect y="760" width="1080" height="590" fill="#1a1614"/>
      <ellipse cx="540" cy="520" rx="280" ry="340" fill="url(#key)"/>
    </svg>`);
  return sharp(svg).jpeg({ quality: 90 }).toBuffer();
}

async function proofSource(boothId: string) {
  const latest = await prisma.generation.findFirst({
    where: { boothId, kind: "photo", status: "ready", outputPath: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { outputPath: true, promptTitle: true },
  });
  if (latest?.outputPath) {
    return { buffer: await readStored(latest.outputPath), themeTitle: latest.promptTitle };
  }
  return { buffer: await syntheticGuest(), themeTitle: "Proof guest" };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { booth } = await requireBoothAccess(id);
    const contentType = request.headers.get("content-type") || "";
    let brand = parseBrand(booth.brand);

    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      if (body.brand) brand = brandSchema.parse(body.brand);
    }

    const source = await proofSource(booth.id);
    const branded = await composeBrandedStill(source.buffer, brand, `${env.APP_URL}/s/preview`, {
      themeTitle: brand.subtitle || source.themeTitle,
      dateLabel: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
    });
    return new Response(new Uint8Array(branded), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" },
    });
  } catch (error) {
    return jsonError(error);
  }
}
