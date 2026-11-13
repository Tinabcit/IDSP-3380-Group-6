import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js reads .env.local, so the Prisma CLI does too (then .env as a fallback).
config({ path: ".env.local" });
config();

/**
 * Settings for the Prisma CLI (generate, db pull, studio).
 * The CLI uses DIRECT_URL (a direct / session connection); the running app
 * uses DATABASE_URL (the pooled connection) in lib/db/prisma.ts.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  // `npx prisma db seed` (or `npm run db:seed`) runs this. See prisma/seed.ts.
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
