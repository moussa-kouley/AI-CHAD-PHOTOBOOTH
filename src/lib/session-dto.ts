export function serializeSession(session: {
  id: string;
  shareToken: string;
  status: string;
  email?: string | null;
  sourcePath?: string | null;
  booth?: { publicToken: string } | null;
  generations: Array<{
    id: string;
    kind: string;
    status: string;
    brandedPath: string | null;
    outputPath: string | null;
    error: string | null;
    promptTitle: string;
  }>;
}) {
  return {
    id: session.id,
    shareToken: session.shareToken,
    status: session.status,
    email: session.email || null,
    sharePath: `/s/${session.shareToken}`,
    kioskPath: session.booth ? `/kiosk/${session.booth.publicToken}` : null,
    boothToken: session.booth?.publicToken || null,
    original: session.sourcePath ? `/api/media/${session.sourcePath}` : null,
    generations: session.generations.map((item) => {
      const still = item.brandedPath || item.outputPath;
      const isVideo = item.kind === "video";
      return {
        id: item.id,
        kind: item.kind,
        status: item.status,
        title: item.promptTitle,
        image: !isVideo && still ? `/api/media/${still}` : null,
        video: isVideo && item.outputPath?.endsWith(".mp4") ? `/api/media/${item.outputPath}` : null,
        raw: item.outputPath ? `/api/media/${item.outputPath}` : null,
        error: item.error,
      };
    }),
  };
}
