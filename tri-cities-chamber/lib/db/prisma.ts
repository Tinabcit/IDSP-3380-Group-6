import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * One shared Prisma client for the server. Only server code (lib/db/actions.ts)
 * imports this file, so the database URL never reaches the browser.
 *
 * DATABASE_URL is Supabase's pooled connection string (see .env.example).
 * In development the client is kept on globalThis so hot reloads do not open
 * a new connection pool every time a file is saved.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Gets the shared client, creating it the first time. Throws a clear error if DATABASE_URL is missing. */
export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  }
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}
