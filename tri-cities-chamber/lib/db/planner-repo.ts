import type { CompTicket } from "@/components/partners/give-comp-tickets-dialog";
import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client";
import { isUuid, newId } from "@/lib/planner/ids";
import type {
  ActivityEntry,
  ChamberEvent,
  Contract,
  EventInput,
  Pillar,
  Sponsor,
  SponsorInput,
  StaffMember,
  Task,
  TaskInput,
} from "@/lib/planner/types";

import {
  contractData,
  eventCompTicketRows,
  eventData,
  profileSettingsData,
  sponsorCompTicketData,
  sponsorData,
  sponsorTodoRows,
  taskData,
  toActivityEntry,
  toChamberEvent,
  toContract,
  toDbDate,
  toPillar,
  toProfileSettings,
  toSponsor,
  toSponsorCompTicket,
  toStaffMember,
  toTask,
  type ProfileSettings,
} from "./mappers";

/**
 * Every database read and write the app makes. Each function takes the Prisma
 * client, so the same code runs in the server actions (lib/db/actions.ts) and
 * in tests against a local database.
 *
 * Writes that touch more than one table run in a transaction, so they either
 * all happen or none do. The history line (activity_log) is written in the
 * same transaction as the change it describes.
 */

type Db = PrismaClient;
type Tx = Prisma.TransactionClient;

/** How many history lines the app shows (the browser version kept the same 200). */
const ACTIVITY_LIMIT = 200;

/** Everything the app loads when it starts. */
export interface PlannerSnapshot {
  pillars: Pillar[];
  staff: StaffMember[];
  /** The staff profile of the person who is signed in. */
  currentProfileId: string;
  data: {
    events: ChamberEvent[];
    tasks: Task[];
    sponsors: Sponsor[];
    contracts: Contract[];
    activity: ActivityEntry[];
  };
}

/** Who is signed in, from the Google session. */
export interface SessionPerson {
  email: string;
  name?: string | null;
}

/** Throws if an id is not a UUID, before it reaches a query. */
function assertUuid(value: unknown, what: string): asserts value is string {
  if (!isUuid(value)) throw new Error(`Invalid ${what} id`);
}

/**
 * Finds the staff profile for the signed-in person (matched by email),
 * creating one with the "staff" role the first time they sign in.
 */
export async function ensureProfile(db: Db, person: SessionPerson): Promise<string> {
  const existing = await db.profile.findFirst({
    where: { email: { equals: person.email, mode: "insensitive" } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await db.profile.create({
    data: { id: newId(), email: person.email, fullName: person.name || null, role: "staff" },
    select: { id: true },
  });
  return created.id;
}

/** Loads all the app data in one go (and makes sure the signed-in person has a profile). */
export async function loadPlannerSnapshot(db: Db, person: SessionPerson): Promise<PlannerSnapshot> {
  const currentProfileId = await ensureProfile(db, person);
  const [pillars, profiles, events, tasks, sponsors, agreements, activity] = await Promise.all([
    db.pillar.findMany({ orderBy: [{ createdAt: "asc" }, { name: "asc" }] }),
    db.profile.findMany({ orderBy: [{ fullName: "asc" }, { email: "asc" }] }),
    db.event.findMany({ orderBy: { createdAt: "asc" }, include: { compTickets: true } }),
    db.task.findMany({ orderBy: { createdAt: "asc" } }),
    db.sponsor.findMany({ orderBy: { createdAt: "asc" }, include: { todos: true } }),
    // Newest first, like the browser version (new contracts went to the top).
    db.sponsorAgreement.findMany({
      orderBy: { createdAt: "desc" },
      include: { payments: true, deliverables: true },
    }),
    db.activityLog.findMany({ orderBy: { at: "desc" }, take: ACTIVITY_LIMIT }),
  ]);
  return {
    pillars: pillars.map(toPillar),
    staff: profiles.map(toStaffMember),
    currentProfileId,
    data: {
      events: events.map(toChamberEvent),
      tasks: tasks.map(toTask),
      sponsors: sponsors.map(toSponsor),
      contracts: agreements.map(toContract),
      activity: activity.map(toActivityEntry),
    },
  };
}

/**
 * Saves one history line. The line says who made the change; if that person
 * has no profile (an old or made-up id), the signed-in person is used instead.
 */
async function logActivity(tx: Tx, entry: ActivityEntry | undefined, actorId: string) {
  if (!entry) return;
  assertUuid(entry.id, "activity");
  const userExists =
    isUuid(entry.userId) && (await tx.profile.count({ where: { id: entry.userId } })) > 0;
  await tx.activityLog.create({
    data: {
      id: entry.id,
      at: new Date(entry.at),
      userId: userExists ? entry.userId : actorId,
      message: entry.message,
      agreementId: isUuid(entry.contractId) ? entry.contractId : null,
    },
  });
}

/** Works out whether an id belongs to a payment, a deliverable, or neither. */
async function itemKind(tx: Tx, itemId: string | undefined): Promise<"payment" | "deliverable" | null> {
  if (!isUuid(itemId)) return null;
  if ((await tx.agreementPayment.count({ where: { id: itemId } })) > 0) return "payment";
  if ((await tx.agreementDeliverable.count({ where: { id: itemId } })) > 0) return "deliverable";
  return null;
}

// --- Tasks ---------------------------------------------------------------------

/** Saves a new task. */
export async function createTask(db: Db, actorId: string, task: Task, entry?: ActivityEntry) {
  assertUuid(task.id, "task");
  await db.$transaction(async (tx) => {
    await tx.task.create({
      data: {
        id: task.id,
        completed: task.completed,
        createdAt: new Date(task.createdAt),
        ...taskData(task, await itemKind(tx, task.contractItemId)),
      },
    });
    await logActivity(tx, entry, actorId);
  });
}

/** Saves the edited fields of a task. */
export async function updateTask(db: Db, actorId: string, id: string, input: TaskInput, entry?: ActivityEntry) {
  assertUuid(id, "task");
  await db.$transaction(async (tx) => {
    await tx.task.update({ where: { id }, data: taskData(input, await itemKind(tx, input.contractItemId)) });
    await logActivity(tx, entry, actorId);
  });
}

/** Ticks or unticks a task, and the payment or deliverable it mirrors (if any). */
export async function setTaskCompleted(
  db: Db,
  actorId: string,
  id: string,
  completed: boolean,
  entry?: ActivityEntry
) {
  assertUuid(id, "task");
  await db.$transaction(async (tx) => {
    const task = await tx.task.update({ where: { id }, data: { completed } });
    if (task.agreementId && task.paymentId) {
      await tx.agreementPayment.update({ where: { id: task.paymentId }, data: { paid: completed } });
    }
    if (task.agreementId && task.deliverableId) {
      await tx.agreementDeliverable.update({ where: { id: task.deliverableId }, data: { done: completed } });
    }
    await logActivity(tx, entry, actorId);
  });
}

/** Deletes a task (the contract it came from is not changed). */
export async function deleteTask(db: Db, actorId: string, id: string, entry?: ActivityEntry) {
  assertUuid(id, "task");
  await db.$transaction(async (tx) => {
    await tx.task.deleteMany({ where: { id } });
    await logActivity(tx, entry, actorId);
  });
}

// --- Events --------------------------------------------------------------------

/** Saves a new event. New events start with the "planning" status. */
export async function createEvent(db: Db, actorId: string, event: ChamberEvent, entry?: ActivityEntry) {
  assertUuid(event.id, "event");
  await db.$transaction(async (tx) => {
    await tx.event.create({ data: { id: event.id, status: "planning", ...eventData(event) } });
    await tx.eventCompTicket.createMany({ data: eventCompTicketRows(event.id, event) });
    await logActivity(tx, entry, actorId);
  });
}

/** Saves the edited fields of an event and replaces its comp ticket list. */
export async function updateEvent(db: Db, actorId: string, id: string, input: EventInput, entry?: ActivityEntry) {
  assertUuid(id, "event");
  await db.$transaction(async (tx) => {
    await tx.event.update({ where: { id }, data: eventData(input) });
    await tx.eventCompTicket.deleteMany({ where: { eventId: id } });
    await tx.eventCompTicket.createMany({ data: eventCompTicketRows(id, input) });
    await logActivity(tx, entry, actorId);
  });
}

/**
 * Deletes an event. Like the app, its tasks and contracts are kept but no
 * longer point at it. Rows in tables the app does not use yet are unlinked
 * (advertising) or removed (sponsor_events) so the delete is not blocked.
 */
export async function deleteEvent(db: Db, actorId: string, id: string, entry?: ActivityEntry) {
  assertUuid(id, "event");
  await db.$transaction(async (tx) => {
    await tx.task.updateMany({ where: { eventId: id }, data: { eventId: null } });
    await tx.sponsorAgreement.updateMany({ where: { eventId: id }, data: { eventId: null } });
    await tx.sponsorAdvertising.updateMany({ where: { eventId: id }, data: { eventId: null } });
    await tx.sponsorEvent.deleteMany({ where: { eventId: id } });
    await tx.event.deleteMany({ where: { id } });
    await logActivity(tx, entry, actorId);
  });
}

// --- Sponsors ------------------------------------------------------------------

/** Saves a new sponsor and its to do list. */
export async function createSponsor(db: Db, actorId: string, sponsor: Sponsor, entry?: ActivityEntry) {
  assertUuid(sponsor.id, "sponsor");
  await db.$transaction(async (tx) => {
    // rank is required by the table; the app has no field for it yet.
    await tx.sponsor.create({ data: { id: sponsor.id, rank: "event_only", ...sponsorData(sponsor) } });
    await tx.sponsorTodo.createMany({ data: sponsorTodoRows(sponsor.id, sponsor) });
    await logActivity(tx, entry, actorId);
  });
}

/** Saves the edited fields of a sponsor and replaces its to do list. */
export async function updateSponsor(db: Db, actorId: string, id: string, input: SponsorInput, entry?: ActivityEntry) {
  assertUuid(id, "sponsor");
  await db.$transaction(async (tx) => {
    await tx.sponsor.update({ where: { id }, data: sponsorData(input) });
    await tx.sponsorTodo.deleteMany({ where: { sponsorId: id } });
    await tx.sponsorTodo.createMany({ data: sponsorTodoRows(id, input) });
    await logActivity(tx, entry, actorId);
  });
}

// --- Contracts -----------------------------------------------------------------

/** Saves a new contract with its payments, deliverables and the reminder tasks made from them. */
export async function createContract(
  db: Db,
  actorId: string,
  contract: Contract,
  tasks: Task[],
  entry?: ActivityEntry
) {
  assertUuid(contract.id, "contract");
  const paymentIds = new Set(contract.payments.map((p) => p.id));
  await db.$transaction(async (tx) => {
    await tx.sponsorAgreement.create({ data: contractData(contract) });
    await tx.agreementPayment.createMany({
      data: contract.payments.map((p, position) => ({
        id: p.id,
        agreementId: contract.id,
        label: p.label,
        dueDate: toDbDate(p.dueDate),
        amount: p.amount,
        paid: p.paid,
        position,
      })),
    });
    await tx.agreementDeliverable.createMany({
      data: contract.deliverables.map((d, position) => ({
        id: d.id,
        agreementId: contract.id,
        label: d.label,
        dueDate: toDbDate(d.dueDate),
        done: d.done,
        position,
      })),
    });
    await tx.task.createMany({
      data: tasks.map((task) => ({
        id: task.id,
        completed: task.completed,
        createdAt: new Date(task.createdAt),
        ...taskData(task, task.contractItemId && paymentIds.has(task.contractItemId) ? "payment" : "deliverable"),
      })),
    });
    await logActivity(tx, entry, actorId);
  });
}

/** Marks a payment as paid (or a deliverable as done) and ticks the tasks that mirror it. */
export async function setContractItemDone(
  db: Db,
  actorId: string,
  contractId: string,
  itemId: string,
  done: boolean,
  entry?: ActivityEntry
) {
  assertUuid(contractId, "contract");
  assertUuid(itemId, "item");
  await db.$transaction(async (tx) => {
    await tx.agreementPayment.updateMany({ where: { id: itemId, agreementId: contractId }, data: { paid: done } });
    await tx.agreementDeliverable.updateMany({ where: { id: itemId, agreementId: contractId }, data: { done } });
    await tx.task.updateMany({
      where: { OR: [{ paymentId: itemId }, { deliverableId: itemId }] },
      data: { completed: done },
    });
    await logActivity(tx, entry, actorId);
  });
}

/** Changes a contract's status (draft, active or completed). */
export async function setContractStatus(
  db: Db,
  actorId: string,
  id: string,
  status: Contract["status"],
  entry?: ActivityEntry
) {
  assertUuid(id, "contract");
  if (!["draft", "active", "completed"].includes(status)) throw new Error("Invalid contract status");
  await db.$transaction(async (tx) => {
    await tx.sponsorAgreement.update({ where: { id }, data: { status } });
    await logActivity(tx, entry, actorId);
  });
}

/**
 * Deletes a contract with its payments, deliverables and the tasks made from
 * it. Old history lines are kept but no longer point at the contract.
 */
export async function deleteContract(db: Db, actorId: string, id: string, entry?: ActivityEntry) {
  assertUuid(id, "contract");
  await db.$transaction(async (tx) => {
    await tx.task.deleteMany({ where: { agreementId: id } });
    await tx.agreementPayment.deleteMany({ where: { agreementId: id } });
    await tx.agreementDeliverable.deleteMany({ where: { agreementId: id } });
    await tx.activityLog.updateMany({ where: { agreementId: id }, data: { agreementId: null } });
    await tx.sponsorAgreement.deleteMany({ where: { id } });
    await logActivity(tx, entry, actorId);
  });
}

// --- Partners page comp tickets ---------------------------------------------------

/** Every comp ticket made on the Partners page, oldest first (the order the page adds them). */
export async function listSponsorCompTickets(db: Db): Promise<CompTicket[]> {
  const rows = await db.sponsorCompTicket.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(toSponsorCompTicket);
}

/** Saves a new comp ticket, linking it to the sponsor whose name matches (if any). */
export async function createSponsorCompTicket(db: Db, ticket: CompTicket) {
  assertUuid(ticket.id, "comp ticket");
  const sponsor = await db.sponsor.findFirst({
    where: { name: { equals: ticket.sponsorName.trim(), mode: "insensitive" } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  await db.sponsorCompTicket.create({ data: sponsorCompTicketData(ticket, sponsor?.id ?? null) });
}

/** Deletes a comp ticket. */
export async function deleteSponsorCompTicket(db: Db, id: string) {
  assertUuid(id, "comp ticket");
  await db.sponsorCompTicket.deleteMany({ where: { id } });
}

// --- Settings page ------------------------------------------------------------------

/** The Settings page values for a profile. */
export async function getProfileSettings(db: Db, profileId: string): Promise<ProfileSettings> {
  assertUuid(profileId, "profile");
  return toProfileSettings(await db.profile.findUniqueOrThrow({ where: { id: profileId } }));
}

/** Saves the Settings page values to a profile (the sign-in email is never changed). */
export async function saveProfileSettings(db: Db, profileId: string, settings: ProfileSettings) {
  assertUuid(profileId, "profile");
  // The page only allows images up to 1 MB; 1.5 million characters covers that as base64.
  if (settings.photo && (!settings.photo.startsWith("data:image/") || settings.photo.length > 1_500_000)) {
    throw new Error("Invalid profile picture");
  }
  await db.profile.update({ where: { id: profileId }, data: profileSettingsData(settings) });
}
