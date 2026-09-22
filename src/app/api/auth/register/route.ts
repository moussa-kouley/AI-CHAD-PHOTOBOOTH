import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { jsonError, AppError } from "@/lib/errors";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { ensureSystemPromptsIfEmpty } from "@/lib/prompt-sync";
import { apiCopy, studio } from "@/lib/studio-copy";

export async function POST(request: Request) {
  try {
    rateLimit(`register:${clientIp(request)}`, 8);
    const body = registerSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) throw new AppError(409, apiCopy.emailTaken, "EMAIL_TAKEN");

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        name: body.name,
        passwordHash: await hashPassword(body.password),
      },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: body.workspaceName,
        credits: 40,
        memberships: { create: { userId: user.id, role: "owner" } },
      },
    });

    await ensureSystemPromptsIfEmpty();

    await prisma.photobooth.create({
      data: {
        workspaceId: workspace.id,
        name: apiCopy.mainBooth,
        slug: nanoid(10),
        publicToken: nanoid(16),
        selectedPrompts: JSON.stringify([]),
        brand: JSON.stringify({
          frame: "strip",
          eventName: body.workspaceName,
          subtitle: studio.floor.defaultSubtitle,
          primary: "#c8a25a",
        }),
      },
    });

    await createSession({ userId: user.id, workspaceId: workspace.id, role: "owner" });
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
