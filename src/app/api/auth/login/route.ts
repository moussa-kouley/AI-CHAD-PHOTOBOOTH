import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { AppError, jsonError } from "@/lib/errors";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { apiCopy } from "@/lib/studio-copy";

export async function POST(request: Request) {
  try {
    rateLimit(`login:${clientIp(request)}`, 12);
    const body = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { memberships: true },
    });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new AppError(401, apiCopy.badCredentials, "BAD_CREDENTIALS");
    }
    const membership = user.memberships[0];
    if (!membership) throw new AppError(403, apiCopy.noWorkspace, "NO_WORKSPACE");
    await createSession({ userId: user.id, workspaceId: membership.workspaceId, role: membership.role });
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
