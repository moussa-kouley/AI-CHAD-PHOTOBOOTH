import { prisma } from "./db";
import { PROMPT_RENAMES, SYSTEM_PROMPTS } from "./prompts";

export async function ensureSystemPrompts() {
  const existing = await prisma.prompt.findMany({ where: { scope: "system" } });
  const byTitle = new Map(existing.map((prompt) => [prompt.title, prompt]));

  for (const [oldTitle, nextTitle] of Object.entries(PROMPT_RENAMES)) {
    const stale = byTitle.get(oldTitle);
    if (!stale || byTitle.has(nextTitle)) continue;
    const updated = await prisma.prompt.update({
      where: { id: stale.id },
      data: { title: nextTitle },
    });
    byTitle.delete(oldTitle);
    byTitle.set(nextTitle, updated);
  }

  for (const prompt of SYSTEM_PROMPTS) {
    const found = byTitle.get(prompt.title);
    if (found) {
      await prisma.prompt.update({
        where: { id: found.id },
        data: { category: prompt.category, body: prompt.body, videoHint: prompt.videoHint },
      });
    } else {
      await prisma.prompt.create({
        data: {
          scope: "system",
          category: prompt.category,
          title: prompt.title,
          body: prompt.body,
          videoHint: prompt.videoHint,
        },
      });
    }
  }

  await offerHorizonLooks();
  await offerAtelierLooks();
  await offerXrLooks();
}

async function offerHorizonLooks() {
  const extra = await prisma.prompt.findMany({
    where: {
      scope: "system",
      OR: [
        { category: { in: ["Horizon", "Chad", "Tchad"] } },
        { title: { in: ["Orbit", "Vault", "Arrival", "Forum", "Dune", "Ridge", "Court", "Hearth", "Stone", "Quay", "Pulse", "Marina", "Paris", "Lagos", "Dubai"] } },
      ],
    },
    select: { id: true },
  });
  if (!extra.length) return;
  const ids = extra.map((item) => item.id);
  const booths = await prisma.photobooth.findMany({
    select: { id: true, name: true, selectedPrompts: true, brand: true },
  });
  for (const booth of booths) {
    const haystack = `${booth.name} ${booth.brand || ""}`.toLowerCase();
    if (!/tchad|chad|ndjamena|n'djamena|n’djamena|igf|fgi|forum/.test(haystack)) continue;
    let selected: string[] = [];
    try {
      selected = JSON.parse(booth.selectedPrompts || "[]") as string[];
    } catch {
      selected = [];
    }
    if (!selected.length) continue;
    const next = [...new Set([...selected, ...ids])];
    if (next.length === selected.length) continue;
    await prisma.photobooth.update({
      where: { id: booth.id },
      data: { selectedPrompts: JSON.stringify(next) },
    });
  }
}

async function offerAtelierLooks() {
  const extra = await prisma.prompt.findMany({
    where: { scope: "system", category: "Atelier" },
    select: { id: true },
  });
  if (!extra.length) return;
  const ids = extra.map((item) => item.id);
  const booths = await prisma.photobooth.findMany({
    select: { id: true, selectedPrompts: true },
  });
  for (const booth of booths) {
    let selected: string[] = [];
    try {
      selected = JSON.parse(booth.selectedPrompts || "[]") as string[];
    } catch {
      selected = [];
    }
    if (!selected.length) continue;
    const next = [...new Set([...selected, ...ids])];
    if (next.length === selected.length) continue;
    await prisma.photobooth.update({
      where: { id: booth.id },
      data: { selectedPrompts: JSON.stringify(next) },
    });
  }
}

async function offerXrLooks() {
  const extra = await prisma.prompt.findMany({
    where: {
      scope: "system",
      OR: [{ category: { in: ["XR", "Spatial"] } }, { title: { in: ["Lunettes", "Salle XR", "Jeu", "Spatial", "Holo", "Visor"] } }],
    },
    select: { id: true },
  });
  if (!extra.length) return;
  const ids = extra.map((item) => item.id);
  const booths = await prisma.photobooth.findMany({
    select: { id: true, selectedPrompts: true },
  });
  for (const booth of booths) {
    let selected: string[] = [];
    try {
      selected = JSON.parse(booth.selectedPrompts || "[]") as string[];
    } catch {
      selected = [];
    }
    if (!selected.length) continue;
    const next = [...new Set([...selected, ...ids])];
    if (next.length === selected.length) continue;
    await prisma.photobooth.update({
      where: { id: booth.id },
      data: { selectedPrompts: JSON.stringify(next) },
    });
  }
}
