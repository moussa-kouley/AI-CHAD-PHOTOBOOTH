import { prisma } from "@/lib/db";
import { AppError, jsonError } from "@/lib/errors";
import { publish, putShot, takeShot } from "@/lib/lens-hub";
import { apiCopy } from "@/lib/studio-copy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function boothOrThrow(token: string) {
  const booth = await prisma.photobooth.findUnique({ where: { publicToken: token } });
  if (!booth || !booth.isActive) throw new AppError(404, apiCopy.boothOffline, "BOOTH_OFFLINE");
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    await boothOrThrow(token);
    const form = await request.formData();
    const photo = form.get("photo");
    if (!(photo instanceof Blob) || photo.size < 800) throw new AppError(400, apiCopy.missingStill, "SHOT");
    const buf = Buffer.from(await photo.arrayBuffer());
    putShot(token, buf, photo.type || "image/jpeg");
    publish(token, { type: "shot", from: "lens" });
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    await boothOrThrow(token);
    const shot = takeShot(token);
    if (!shot) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(shot.buf), {
      headers: {
        "Content-Type": shot.type,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
