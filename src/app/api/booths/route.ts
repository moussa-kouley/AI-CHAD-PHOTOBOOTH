import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { boothSchema } from "@/lib/validators";
import { jsonError } from "@/lib/errors";

export async function GET() {
  try {
    const session = await requireSession();
    const booths = await prisma.photobooth.findMany({
      where: { workspaceId: session.workspaceId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { sessions: true, generations: true } } },
    });
    const workspace = await prisma.workspace.findUniqueOrThrow({ where: { id: session.workspaceId } });
    return Response.json({
      booths,
      credits: workspace.credits,
      plan: workspace.plan,
      workspaceName: workspace.name,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = boothSchema.parse(await request.json());
    const booth = await prisma.photobooth.create({
      data: {
        workspaceId: session.workspaceId,
        name: body.name,
        slug: nanoid(10),
        publicToken: nanoid(16),
        workflow: body.workflow,
        aspectRatio: body.aspectRatio,
        promptMode: body.promptMode,
        selectedPrompts: JSON.stringify(body.selectedPrompts),
        deliveryMode: body.deliveryMode,
        videoEnabled: body.videoEnabled,
        brand: JSON.stringify(body.brand),
      },
    });
    return Response.json({ booth });
  } catch (error) {
    return jsonError(error);
  }
}
