import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";

import { runDemoSeed } from "@/lib/db/demo-seed";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Seed command: loads the pillars and the demo data into the database.
 *
 *   npm run db:seed        (or: npx prisma db seed)
 *
 * Safe to run again: it replaces the demo rows (with fresh dates) instead of
 * adding copies, and leaves everything else alone. See lib/db/demo-seed.ts.
 * It writes to whatever database .env.local points at, so think twice before
 * running it against the real one: the demo partners and contracts will show
 * up for everyone.
 */

config({ path: ".env.local" });
config();

/** Connects, seeds, prints what was written, and disconnects. */
async function main() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Set DIRECT_URL or DATABASE_URL in .env.local (see .env.example).");
  }
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const summary = await runDemoSeed(db);
    console.log("Seeded the database:");
    for (const [what, count] of Object.entries(summary)) console.log(`  ${what}: ${count}`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
