import { createHash } from "node:crypto";

import type { PrismaClient } from "@/lib/generated/prisma/client";
import { todayISO } from "@/lib/planner/dates";
import { buildMockActivity, buildMockContracts } from "@/lib/planner/mock-contracts";
import { buildMockEvents, buildMockTasks, PILLARS, SPONSORS, STAFF } from "@/lib/planner/mock-data";
import type { ActivityEntry, ChamberEvent, Contract, ISODate, Sponsor, Task } from "@/lib/planner/types";

import * as repo from "./planner-repo";

/**
 * Loads the demo data (lib/planner/mock-data.ts and mock-contracts.ts) into
 * the database. Run with `npm run db:seed` (see prisma/seed.ts).
 *
 * Safe to run again: every demo row gets a fixed UUID made from its readable
 * name ("event-gala" always becomes the same UUID), so a second run finds the
 * demo rows and replaces them (with dates moved to the new "today") instead of
 * adding copies. Rows people added in the app are left alone, with the same
 * side effects as deleting a demo row in the app: tasks and contracts that
 * point at a demo event are unlinked from it, and tasks someone attached to a
 * demo contract are removed with it.
 */

/** Turns a readable demo id like "event-gala" into the same UUID every time. */
export function demoId(key: string): string {
  const hex = createHash("sha1").update(`tri-cities-chamber-demo:${key}`).digest("hex");
  // Shape it like a version 5 (name-based) UUID.
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/** Maps an optional demo id to its UUID. */
function optId(key: string | undefined): string | undefined {
  return key ? demoId(key) : undefined;
}

/** The demo data with every id turned into a UUID, ready to save. */
export interface DemoData {
  staff: { id: string; fullName: string }[];
  sponsors: Sponsor[];
  events: ChamberEvent[];
  contracts: Contract[];
  tasks: Task[];
  activity: ActivityEntry[];
}

/**
 * Builds the demo data for a given day. Pillars are matched by name, so the
 * demo events use the pillars already in the database (pillarIdByName).
 */
export function buildDemoData(today: ISODate, pillarIdByName: Map<string, string>): DemoData {
  const pillarName = new Map(PILLARS.map((p) => [p.id, p.name]));
  return {
    staff: STAFF.map((s) => ({ id: demoId(s.id), fullName: s.name })),
    sponsors: SPONSORS.map((s) => ({ ...s, id: demoId(s.id), todos: s.todos ?? [] })),
    events: buildMockEvents(today).map((e) => ({
      ...e,
      id: demoId(e.id),
      pillarId: pillarIdByName.get(pillarName.get(e.pillarId) ?? "") ?? "",
    })),
    contracts: buildMockContracts(today).map((c) => ({
      ...c,
      id: demoId(c.id),
      sponsorId: demoId(c.sponsorId),
      eventId: optId(c.eventId),
      payments: c.payments.map((p) => ({ ...p, id: demoId(p.id) })),
      deliverables: c.deliverables.map((d) => ({ ...d, id: demoId(d.id) })),
    })),
    tasks: buildMockTasks(today).map((t) => ({
      ...t,
      id: demoId(t.id),
      assigneeId: demoId(t.assigneeId),
      eventId: optId(t.eventId),
      sponsorId: optId(t.sponsorId),
      contractId: optId(t.contractId),
      contractItemId: optId(t.contractItemId),
    })),
    activity: buildMockActivity().map((a) => ({
      ...a,
      id: demoId(a.id),
      userId: demoId(a.userId),
      contractId: optId(a.contractId),
    })),
  };
}

/** Throws a clear message if supabase/migrations/0001 has not been run yet. */
async function checkMigration(db: PrismaClient) {
  const rows = await db.$queryRaw<{ n: bigint }[]>`
    select count(*) as n from information_schema.columns
    where table_schema = 'public'
      and ((table_name = 'tasks' and column_name in ('start_time', 'end_time'))
        or (table_name = 'events' and column_name = 'attendees'))`;
  if (Number(rows[0]?.n ?? 0) < 3) {
    throw new Error(
      "The database is missing columns the app uses. Run supabase/migrations/0001_match_app_fields.sql in the Supabase SQL editor first."
    );
  }
}

/** What a seed run did, for the summary printed at the end. */
export interface SeedSummary {
  pillars: number;
  staff: number;
  sponsors: number;
  events: number;
  contracts: number;
  tasks: number;
  activity: number;
}

/** Writes the pillars and demo data to the database (replacing earlier demo rows). */
export async function runDemoSeed(db: PrismaClient, today: ISODate = todayISO()): Promise<SeedSummary> {
  await checkMigration(db);

  // 1. Pillars: reuse ones that already exist (same name), add the rest.
  const pillarIdByName = new Map<string, string>();
  for (const [position, pillar] of PILLARS.entries()) {
    const existing = await db.pillar.findFirst({ where: { name: pillar.name }, orderBy: { createdAt: "asc" } });
    const row =
      existing ??
      (await db.pillar.create({
        // Spaced by a millisecond so they load in this order.
        data: { id: demoId(pillar.id), name: pillar.name, createdAt: new Date(Date.now() + position) },
      }));
    pillarIdByName.set(pillar.name, row.id);
  }

  const demo = buildDemoData(today, pillarIdByName);

  // 2. Demo staff profiles (they show up in "Signed in as" and as task assignees).
  for (const person of demo.staff) {
    await db.profile.upsert({
      where: { id: person.id },
      update: { fullName: person.fullName },
      create: { id: person.id, fullName: person.fullName, role: "staff" },
    });
  }
  // History lines need a person; any demo staff member will do (no lines are written here).
  const actorId = demo.staff[0].id;

  // 3. Demo sponsors: update if they exist, otherwise add.
  for (const sponsor of demo.sponsors) {
    const exists = (await db.sponsor.count({ where: { id: sponsor.id } })) > 0;
    if (exists) await repo.updateSponsor(db, actorId, sponsor.id, sponsor);
    else await repo.createSponsor(db, actorId, sponsor);
  }

  // 4. Remove the previous demo tasks, history, contracts and events (children first).
  for (const task of demo.tasks) await repo.deleteTask(db, actorId, task.id);
  await db.activityLog.deleteMany({ where: { id: { in: demo.activity.map((a) => a.id) } } });
  for (const contract of demo.contracts) await repo.deleteContract(db, actorId, contract.id);
  for (const event of demo.events) await repo.deleteEvent(db, actorId, event.id);

  // 5. Add them again with today's dates (parents first).
  for (const event of demo.events) await repo.createEvent(db, actorId, event);
  for (const contract of demo.contracts) await repo.createContract(db, actorId, contract, []);
  for (const task of demo.tasks) await repo.createTask(db, actorId, task);
  await db.activityLog.createMany({
    data: demo.activity.map((a) => ({
      id: a.id,
      at: new Date(a.at),
      userId: a.userId,
      message: a.message,
      agreementId: a.contractId ?? null,
    })),
  });

  return {
    pillars: pillarIdByName.size,
    staff: demo.staff.length,
    sponsors: demo.sponsors.length,
    events: demo.events.length,
    contracts: demo.contracts.length,
    tasks: demo.tasks.length,
    activity: demo.activity.length,
  };
}
