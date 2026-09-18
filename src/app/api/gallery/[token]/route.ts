import { prisma } from "@/lib/db";
import { AppError, jsonError } from "@/lib/errors";
import { apiCopy } from "@/lib/studio-copy";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const booth = await prisma.photobooth.findUnique({ where: { publicToken: token } });
    if (!booth) throw new AppError(404, apiCopy.galleryNotFound, "NOT_FOUND");
    const photos = await prisma.generation.findMany({
      where: { boothId: booth.id, kind: "photo", status: "ready", brandedPath: { not: null } },
      include: { session: { select: { shareToken: true } } },
      orderBy: { createdAt: "desc" },
      take: 80,
    });
    return Response.json({
      name: booth.name,
      photos: photos.map((item) => ({
        id: item.id,
        image: `/api/media/${item.brandedPath}`,
        title: item.promptTitle,
        sharePath: `/s/${item.session.shareToken}`,
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}
