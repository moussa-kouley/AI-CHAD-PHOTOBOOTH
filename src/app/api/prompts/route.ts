import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { jsonError, AppError } from "@/lib/errors";
import { ensureSystemPrompts } from "@/lib/prompt-sync";
import { compileCustomLook } from "@/lib/custom-look";
import { apiCopy } from "@/lib/studio-copy";
import { z } from "zod";

const customSchema = z.object({
  title: z.string().min(2, apiCopy.twoLetters).max(40),
  kind: z.enum(["Birthday", "Wedding", "Party", "Baby", "Grad", "Custom"]).default("Custom"),
  honoree: z.string().max(60).optional().default(""),
  note: z.string().max(400).optional().default(""),
  color: z.string().regex(/^#?[0-9a-fA-F]{6}$/).optional(),
});

export async function GET() {
  try {
    const session = await requireSession();
    await ensureSystemPrompts();
    const prompts = await prisma.prompt.findMany({
      where: {
        OR: [{ scope: "system" }, { workspaceId: session.workspaceId, scope: "custom" }],
      },
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });
    return Response.json({ prompts });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const parsed = customSchema.parse(await request.json());
    const color = parsed.color?.startsWith("#") ? parsed.color : parsed.color ? `#${parsed.color}` : undefined;
    const look = compileCustomLook({ ...parsed, color });
    const clash = await prisma.prompt.findFirst({
      where: {
        workspaceId: session.workspaceId,
        scope: "custom",
        title: look.title,
      },
    });
    if (clash) throw new AppError(409, apiCopy.lookExists, "LOOK_EXISTS");
    const prompt = await prisma.prompt.create({
      data: {
        workspaceId: session.workspaceId,
        scope: "custom",
        category: look.category,
        title: look.title,
        body: look.body,
        videoHint: look.videoHint,
      },
    });
    return Response.json({ prompt });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireSession();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) throw new AppError(400, apiCopy.missingLook, "NO_LOOK");
    const found = await prisma.prompt.findFirst({
      where: { id, workspaceId: session.workspaceId, scope: "custom" },
    });
    if (!found) throw new AppError(404, apiCopy.lookNotFound, "NOT_FOUND");
    await prisma.prompt.delete({ where: { id: found.id } });
    const booths = await prisma.photobooth.findMany({
      where: { workspaceId: session.workspaceId },
      select: { id: true, selectedPrompts: true },
    });
    for (const booth of booths) {
      let selected: string[] = [];
      try {
        selected = JSON.parse(booth.selectedPrompts || "[]") as string[];
      } catch {
        selected = [];
      }
      const next = selected.filter((item) => item !== found.id);
      if (next.length !== selected.length) {
        await prisma.photobooth.update({
          where: { id: booth.id },
          data: { selectedPrompts: JSON.stringify(next) },
        });
      }
    }
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
