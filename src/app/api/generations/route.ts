import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { jsonError } from "@/lib/errors";

export async function GET() {
  try {
    const session = await requireSession();
    const items = await prisma.generation.findMany({
      where: { booth: { workspaceId: session.workspaceId } },
      include: { booth: true, session: true },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    return Response.json({
      generations: items.map((item) => ({
        id: item.id,
        kind: item.kind,
        status: item.status,
        title: item.promptTitle,
        booth: item.booth.name,
        createdAt: item.createdAt,
        image: item.brandedPath ? `/api/media/${item.brandedPath}` : null,
        sharePath: `/s/${item.session.shareToken}`,
        error: item.error,
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}
