import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { env } from "./env";
import { prisma } from "./db";
import { AppError } from "./errors";
import { apiCopy } from "./studio-copy";

const cookieName = "lumen_session";

function secret() {
  return new TextEncoder().encode(env.AUTH_SECRET);
}

export type SessionPayload = {
  userId: string;
  workspaceId: string;
  role: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());

  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(cookieName);
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const store = await cookies();
    const token = store.get(cookieName)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    if (!payload.userId || !payload.workspaceId) return null;
    return {
      userId: String(payload.userId),
      workspaceId: String(payload.workspaceId),
      role: String(payload.role || "owner"),
    };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new AppError(401, apiCopy.signIn, "UNAUTHENTICATED");
  return session;
}

export async function requireBoothAccess(boothId: string) {
  const session = await requireSession();
  const booth = await prisma.photobooth.findFirst({
    where: { id: boothId, workspaceId: session.workspaceId },
  });
  if (!booth) throw new AppError(404, apiCopy.boothNotFound, "NOT_FOUND");
  return { session, booth };
}
