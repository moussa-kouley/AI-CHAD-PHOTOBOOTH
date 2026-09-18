import { prisma } from "@/lib/db";
import { requireBoothAccess } from "@/lib/auth";
import { boothSchema } from "@/lib/validators";
import { jsonError } from "@/lib/errors";
import { stampBoothPrints } from "@/lib/jobs";
import { brandSchema } from "@/lib/brand-schema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { booth } = await requireBoothAccess(id);
    return Response.json({ booth });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { booth } = await requireBoothAccess(id);
    const raw = await request.json();
    const body = boothSchema.partial().parse({
      ...raw,
      brand: raw.brand ? brandSchema.parse(raw.brand) : undefined,
    });
    const updated = await prisma.photobooth.update({
      where: { id: booth.id },
      data: {
        name: body.name,
        workflow: body.workflow,
        aspectRatio: body.aspectRatio,
        promptMode: body.promptMode,
        selectedPrompts: body.selectedPrompts ? JSON.stringify(body.selectedPrompts) : undefined,
        deliveryMode: body.deliveryMode,
        videoEnabled: body.videoEnabled,
        isActive: body.isActive,
        brand: body.brand ? JSON.stringify(body.brand) : undefined,
      },
    });
    if (body.brand) {
      void stampBoothPrints(booth.id);
    }
    return Response.json({ booth: updated });
  } catch (error) {
    return jsonError(error);
  }
}
