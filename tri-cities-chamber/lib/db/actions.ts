"use server";

import { auth } from "@/auth";
import type {
  ActivityEntry,
  ChamberEvent,
  Contract,
  EventInput,
  Sponsor,
  SponsorInput,
  Task,
  TaskInput,
} from "@/lib/planner/types";

import * as repo from "./planner-repo";
import { getPrisma } from "./prisma";

/**
 * Server actions: the only way the browser reads or changes the database.
 * The store (hooks/use-planner-store.ts) calls these; components never do.
 *
 * Anyone can send a request to a server action, so every one of them checks
 * the Google session first and refuses if nobody is signed in. The work itself
 * is in planner-repo.ts.
 */

/** Gets the signed-in person, or throws if there is none. */
async function requirePerson(): Promise<repo.SessionPerson> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("Not signed in");
  return { email, name: session.user?.name };
}

/** Checks the session and returns the database plus the signed-in person's profile id. */
async function signedIn() {
  const person = await requirePerson();
  const db = getPrisma();
  return { db, actorId: await repo.ensureProfile(db, person) };
}

/**
 * Loads all the app data. Returns null when nobody is signed in (the landing
 * page also sits inside the data provider, and needs no data).
 */
export async function loadPlannerData(): Promise<repo.PlannerSnapshot | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  return repo.loadPlannerSnapshot(getPrisma(), { email, name: session.user?.name });
}

/** Saves a new task. */
export async function createTaskAction(task: Task, entry?: ActivityEntry) {
  const { db, actorId } = await signedIn();
  await repo.createTask(db, actorId, task, entry);
}

/** Saves the edited fields of a task. */
export async function updateTaskAction(id: string, input: TaskInput, entry?: ActivityEntry) {
  const { db, actorId } = await signedIn();
  await repo.updateTask(db, actorId, id, input, entry);
}

/** Ticks or unticks a task (and the payment or deliverable it mirrors). */
export async function setTaskCompletedAction(id: string, completed: boolean, entry?: ActivityEntry) {
  const { db, actorId } = await signedIn();
  await repo.setTaskCompleted(db, actorId, id, completed, entry);
}

/** Deletes a task. */
export async function deleteTaskAction(id: string, entry?: ActivityEntry) {
  const { db, actorId } = await signedIn();
  await repo.deleteTask(db, actorId, id, entry);
}

/** Saves a new event. */
export async function createEventAction(event: ChamberEvent, entry?: ActivityEntry) {
  const { db, actorId } = await signedIn();
  await repo.createEvent(db, actorId, event, entry);
}

/** Saves the edited fields of an event. */
export async function updateEventAction(id: string, input: EventInput, entry?: ActivityEntry) {
  const { db, actorId } = await signedIn();
  await repo.updateEvent(db, actorId, id, input, entry);
}

/** Deletes an event (its tasks and contracts are kept, unlinked). */
export async function deleteEventAction(id: string, entry?: ActivityEntry) {
  const { db, actorId } = await signedIn();
  await repo.deleteEvent(db, actorId, id, entry);
}

/** Saves a new sponsor and its to do list. */
export async function createSponsorAction(sponsor: Sponsor, entry?: ActivityEntry) {
  const { db, actorId } = await signedIn();
  await repo.createSponsor(db, actorId, sponsor, entry);
}

/** Saves the edited fields and to do list of a sponsor. */
export async function updateSponsorAction(id: string, input: SponsorInput, entry?: ActivityEntry) {
  const { db, actorId } = await signedIn();
  await repo.updateSponsor(db, actorId, id, input, entry);
}

/** Saves a new contract with its payments, deliverables and reminder tasks. */
export async function createContractAction(contract: Contract, tasks: Task[], entry?: ActivityEntry) {
  const { db, actorId } = await signedIn();
  await repo.createContract(db, actorId, contract, tasks, entry);
}

/** Marks a payment paid (or a deliverable done) and ticks the tasks that mirror it. */
export async function setContractItemDoneAction(
  contractId: string,
  itemId: string,
  done: boolean,
  entry?: ActivityEntry
) {
  const { db, actorId } = await signedIn();
  await repo.setContractItemDone(db, actorId, contractId, itemId, done, entry);
}

/** Changes a contract's status. */
export async function setContractStatusAction(id: string, status: Contract["status"], entry?: ActivityEntry) {
  const { db, actorId } = await signedIn();
  await repo.setContractStatus(db, actorId, id, status, entry);
}

/** Deletes a contract with its payments, deliverables and tasks. */
export async function deleteContractAction(id: string, entry?: ActivityEntry) {
  const { db, actorId } = await signedIn();
  await repo.deleteContract(db, actorId, id, entry);
}
