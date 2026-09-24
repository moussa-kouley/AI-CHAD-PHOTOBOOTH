import { PrismaClient } from "@prisma/client";
import { AppError } from "./errors";
import { apiCopy } from "./studio-copy";
import { isPrismaConnectable } from "./db-ready";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export { isPrismaConnectable };

function datasourceUrl() {
  const url = process.env.DATABASE_URL || "";
  if (!url || url.includes("connection_limit=")) return url || undefined;
  return `${url}${url.includes("?") ? "&" : "?"}connection_limit=1`;
}

function getClient() {
  if (!isPrismaConnectable()) {
    throw new AppError(503, apiCopy.dbDown, "DB_UNAVAILABLE");
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      datasourceUrl: datasourceUrl(),
    });
  }
  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
