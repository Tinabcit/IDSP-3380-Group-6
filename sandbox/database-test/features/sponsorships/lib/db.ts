import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton for the sandbox.
 * If the repo already exports a client (e.g. "@/lib/prisma"), replace this
 * file's body with: export { prisma } from "@/lib/prisma";
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
