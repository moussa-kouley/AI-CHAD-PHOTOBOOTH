import { prisma } from "@/lib/db";
import { parseBrand } from "@/lib/branding";
import { AppError, jsonError } from "@/lib/errors";
import { ensureSystemPromptsIfEmpty } from "@/lib/prompt-sync";
import { CATEGORY_ORDER, categoryLabel, themeRank } from "@/lib/theme-look";
import { apiCopy } from "@/lib/studio-copy";

const cache = new Map<string, { at: number; body: unknown }>();
const TTL_MS = 20_000;

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const hit = cache.get(token);
    if (hit && Date.now() - hit.at < TTL_MS) {
      return Response.json(hit.body, {
        headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60" },
      });
    }

    const booth = await prisma.photobooth.findUnique({ where: { publicToken: token } });
    if (!booth || !booth.isActive) throw new AppError(404, apiCopy.boothOffline, "BOOTH_OFFLINE");

    await ensureSystemPromptsIfEmpty();
    const selected = JSON.parse(booth.selectedPrompts || "[]") as string[];
    let prompts = await prisma.prompt.findMany({
      where: selected.length
        ? { id: { in: selected } }
        : { OR: [{ scope: "system" }, { workspaceId: booth.workspaceId, scope: "custom" }] },
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });
    if (!prompts.length) {
      prompts = await prisma.prompt.findMany({
        where: { scope: "system" },
        orderBy: [{ category: "asc" }, { title: "asc" }],
      });
    }

    const brand = parseBrand(booth.brand);
    prompts = [...prompts].sort((a, b) => {
      const rank = (category: string) => {
        const label = categoryLabel(category);
        const index = CATEGORY_ORDER.map(categoryLabel).indexOf(label);
        return index < 0 ? 20 : index;
      };
      return rank(a.category) - rank(b.category) || themeRank(a.title) - themeRank(b.title);
    });
    const body = {
      booth: {
        id: booth.id,
        name: booth.name,
        publicToken: booth.publicToken,
        promptMode: booth.promptMode,
        videoEnabled: booth.videoEnabled,
        deliveryMode: booth.deliveryMode,
        aspectRatio: booth.aspectRatio,
        eventName: brand.eventName,
        subtitle: brand.subtitle,
        primary: brand.primary,
        frame: brand.frame,
        consentText: brand.consentText,
      },
      prompts: prompts.map(({ id, title, category, scope, body: promptBody }) => ({ id, title, category, scope, body: promptBody })),
    };
    cache.set(token, { at: Date.now(), body });
    return Response.json(body, {
      headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60" },
    });
  } catch (error) {
    return jsonError(error);
  }
}
