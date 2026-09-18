import { prisma } from "./db";

/** Floor is open: looks are not capped. Keep the ledger helpers for when billing returns. */
export async function spendCredits(_workspaceId: string, _amount: number, _reason: string, _refId?: string) {
  return;
}

export async function refundCredits(workspaceId: string, amount: number, reason: string, refId?: string) {
  if (amount <= 0) return;
  await prisma.$transaction([
    prisma.workspace.update({
      where: { id: workspaceId },
      data: { credits: { increment: amount } },
    }),
    prisma.creditLedger.create({
      data: { workspaceId, delta: amount, reason, refId },
    }),
  ]);
}

export function creditCost(kind: "photo" | "video") {
  return kind === "video" ? 3 : 1;
}
