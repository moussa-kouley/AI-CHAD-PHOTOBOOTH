import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAlibabaCredentials } from "@/lib/env";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ user: null });
  const [user, workspace] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, name: true, email: true } }),
    prisma.workspace.findUnique({ where: { id: session.workspaceId } }),
  ]);
  return Response.json({
    user,
    workspace: workspace
      ? { id: workspace.id, name: workspace.name, credits: workspace.credits, plan: workspace.plan }
      : null,
    demoMode: !hasAlibabaCredentials(),
  });
}
