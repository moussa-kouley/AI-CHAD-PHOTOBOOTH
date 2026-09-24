import { prisma } from "@/lib/db";
import { EVENT_PUBLIC_TOKEN, eventLookTitles } from "@/lib/fgi-agenda";

const SLUG = "fgi-tchad-2026";

export async function ensureEventBooth() {
  const selectedPrompts = JSON.stringify(eventLookTitles());
  const live = {
    publicToken: EVENT_PUBLIC_TOKEN,
    isActive: true,
    promptMode: "user_chooses" as const,
    selectedPrompts,
    videoEnabled: false,
  };

  const existing = await prisma.photobooth.findUnique({ where: { publicToken: EVENT_PUBLIC_TOKEN } });
  if (existing) {
    if (
      existing.isActive &&
      existing.promptMode === "user_chooses" &&
      existing.selectedPrompts === selectedPrompts
    ) {
      return existing;
    }
    return prisma.photobooth.update({
      where: { id: existing.id },
      data: live,
    });
  }

  const bySlug = await prisma.photobooth.findUnique({ where: { slug: SLUG } });
  if (bySlug) {
    return prisma.photobooth.update({
      where: { id: bySlug.id },
      data: live,
    });
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: "FGI Tchad 2026",
      credits: 99_999,
      locale: "fr",
    },
  });

  return prisma.photobooth.create({
    data: {
      workspaceId: workspace.id,
      name: "Booth FGI Tchad",
      slug: SLUG,
      publicToken: EVENT_PUBLIC_TOKEN,
      promptMode: "user_chooses",
      selectedPrompts,
      videoEnabled: false,
      brand: JSON.stringify({
        frame: "poster",
        eventName: "FGI Tchad",
        subtitle: "10e édition · N’Djamena",
        primary: "#FECB00",
        showTitle: true,
      }),
    },
  });
}
