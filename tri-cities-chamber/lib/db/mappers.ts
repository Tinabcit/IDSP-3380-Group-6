import type {
  ActivityLog,
  AgreementDeliverable,
  AgreementPayment,
  Event,
  EventCompTicket as EventCompTicketRow,
  Pillar as PillarRow,
  Profile,
  Sponsor as SponsorRow,
  SponsorAgreement,
  SponsorCompTicket as SponsorCompTicketRow,
  SponsorTodo as SponsorTodoRow,
  Task as TaskRow,
} from "@/lib/generated/prisma/client";
import type { CompTicket } from "@/components/partners/give-comp-tickets-dialog";
import { isUuid } from "@/lib/planner/ids";
import { getInitials } from "@/lib/planner/user";
import type {
  ActivityEntry,
  ChamberEvent,
  Contract,
  ContractStatus,
  EventCategory,
  EventCompTicket,
  EventPriority,
  EventReminder,
  ISODate,
  Pillar,
  Sponsor,
  SponsorLevel,
  StaffMember,
  Task,
} from "@/lib/planner/types";

/**
 * Converts between database rows (Prisma models, snake_case tables) and the
 * app's own types in lib/planner/types.ts. Pure functions, so they are easy
 * to test and the components never see a database shape.
 *
 * Rules used throughout:
 * - A database null becomes a missing (undefined) field in the app, and back.
 * - "date" columns are read and written as UTC midnight, so "2026-11-13"
 *   never shifts a day because of the time zone.
 * - "time" columns are read and written as "HH:mm".
 */

// --- Small converters --------------------------------------------------------

/** Turns a database null into undefined (the app uses missing fields, not null). */
function opt<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/** Turns an empty or missing value into null, for an optional database column. */
export function orNull<T>(value: T | undefined | ""): T | null {
  return value === undefined || value === "" ? null : value;
}

/** Turns an id into null unless it is a UUID (old or placeholder ids cannot be saved). */
export function uuidOrNull(value: string | undefined): string | null {
  return isUuid(value) ? value : null;
}

/** Reads a "date" column as "yyyy-MM-dd". */
export function fromDbDate(value: Date): ISODate {
  return value.toISOString().slice(0, 10);
}

/** Reads an optional "date" column. */
function fromDbDateOpt(value: Date | null): ISODate | undefined {
  return value ? fromDbDate(value) : undefined;
}

/** Writes "yyyy-MM-dd" to a "date" column. */
export function toDbDate(value: ISODate): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/** Writes an optional "yyyy-MM-dd" to a "date" column (missing or empty becomes null). */
export function toDbDateOpt(value: ISODate | undefined): Date | null {
  return value ? toDbDate(value) : null;
}

/** Reads a "time" column as 24-hour "HH:mm". */
export function fromDbTime(value: Date | null): string | undefined {
  return value ? value.toISOString().slice(11, 16) : undefined;
}

/** Writes 24-hour "HH:mm" to a "time" column (missing or empty becomes null). */
export function toDbTime(value: string | undefined): Date | null {
  return value ? new Date(`1970-01-01T${value}:00.000Z`) : null;
}

/** Reads a "numeric" column (Prisma gives a Decimal) as a plain number. */
function fromDbNumber(value: { toString(): string } | number): number {
  return typeof value === "number" ? value : Number(value.toString());
}

// --- Allowed values ------------------------------------------------------------

const EVENT_CATEGORIES: readonly EventCategory[] = ["networking", "workshop", "meeting", "fundraiser", "other"];
const SPONSOR_LEVELS: readonly SponsorLevel[] = ["platinum", "gold", "silver", "bronze"];
const EVENT_REMINDERS: readonly EventReminder[] = ["day-before", "week-before", "on-date"];
const EVENT_PRIORITIES: readonly EventPriority[] = [1, 2, 3, 4, 5, 6];

/** Turns an empty array column into a missing field (the app leaves empty lists out). */
function list<T>(value: T[]): T[] | undefined {
  return value.length > 0 ? value : undefined;
}

/** Keeps a priority the app knows (1 to 6); anything else counts as none. */
function toEventPriority(value: number | null): EventPriority | undefined {
  return EVENT_PRIORITIES.find((p) => p === value);
}

/** Keeps only the reminder values the app knows. */
function toEventReminders(value: string[]): EventReminder[] {
  return value.filter((r): r is EventReminder => (EVENT_REMINDERS as readonly string[]).includes(r));
}

/** Reads a comp ticket status ("Draft" or "Issued"; anything else counts as a draft). */
function toTicketStatus(value: string): "Draft" | "Issued" {
  return value === "Issued" ? "Issued" : "Draft";
}

/** Keeps a category the app knows; anything else counts as missing ("other"). */
function toEventCategory(value: string | null): EventCategory | undefined {
  return EVENT_CATEGORIES.find((c) => c === value);
}

/** Keeps a sponsor level the app knows; anything else counts as no level. */
function toSponsorLevel(value: string | null): SponsorLevel | undefined {
  return SPONSOR_LEVELS.find((l) => l === value);
}

/**
 * Reads a contract status. The table also allows older values: pending
 * renewal still counts as active, expired and cancelled count as completed.
 */
export function toContractStatus(value: string): ContractStatus {
  if (value === "draft" || value === "active" || value === "completed") return value;
  if (value === "pending_renewal") return "active";
  return "completed";
}

// --- Rows -> app types -----------------------------------------------------------

/** A pillar row as the app's Pillar. */
export function toPillar(row: PillarRow): Pillar {
  return { id: row.id, name: row.name };
}

/** A profile row as a staff member (name falls back to the email). */
export function toStaffMember(row: Profile): StaffMember {
  const name = row.fullName?.trim() || row.email || "Staff member";
  return { id: row.id, name, initials: getInitials(name) };
}

/** An event comp ticket row as the app's EventCompTicket. */
export function toEventCompTicket(row: EventCompTicketRow): EventCompTicket {
  return {
    id: row.id,
    recipient: row.recipient,
    ticketType: row.ticketType,
    quantity: row.quantity,
    status: toTicketStatus(row.status),
  };
}

/**
 * An event row (with its comp ticket rows) as the app's ChamberEvent (no pillar
 * becomes ""). Comp tickets are optional so callers that load only the event
 * row still work.
 */
export function toChamberEvent(row: Event & { compTickets?: EventCompTicketRow[] }): ChamberEvent {
  return {
    id: row.id,
    name: row.name,
    startDate: fromDbDate(row.startDate),
    endDate: fromDbDate(row.endDate),
    pillarId: row.pillarId ?? "",
    isSignature: row.isSignature,
    location: opt(row.location),
    startTime: fromDbTime(row.startTime),
    endTime: fromDbTime(row.endTime),
    description: opt(row.description),
    category: toEventCategory(row.category),
    sponsorName: opt(row.sponsorName),
    email: opt(row.contactEmail),
    phone: opt(row.contactPhone),
    address: opt(row.address),
    fileName: opt(row.fileName),
    attendees: opt(row.attendees),
    sponsorNames: list(row.sponsorNames),
    picture: opt(row.picture),
    deadline: fromDbDateOpt(row.deadline),
    priority: toEventPriority(row.priority),
    labels: list(row.labels),
    reminders: list(toEventReminders(row.reminders)),
    guests: list(row.guests),
    tickets: list(row.tickets),
    compTickets: list(
      [...(row.compTickets ?? [])].sort((a, b) => a.position - b.position).map(toEventCompTicket)
    ),
  };
}

/** A sponsor row (with its to do rows) as the app's Sponsor. */
export function toSponsor(row: SponsorRow & { todos: SponsorTodoRow[] }): Sponsor {
  return {
    id: row.id,
    name: row.name,
    contactName: opt(row.contactName),
    contactEmail: opt(row.contactEmail),
    contactPhone: opt(row.contactPhone),
    website: opt(row.website),
    level: toSponsorLevel(row.level),
    notes: opt(row.notes),
    status: row.status === "draft" ? "draft" : "active",
    todos: [...row.todos]
      .sort((a, b) => a.position - b.position)
      .map((t) => ({ id: t.id, title: t.title, done: t.done })),
  };
}

/** An agreement row (with payments and deliverables) as the app's Contract. */
export function toContract(
  row: SponsorAgreement & { payments: AgreementPayment[]; deliverables: AgreementDeliverable[] }
): Contract {
  const hasSummary =
    row.summaryOverview !== null || row.summaryKeyTerms.length > 0 || row.summaryWatchouts.length > 0;
  return {
    id: row.id,
    title: row.title,
    sponsorId: row.sponsorId,
    eventId: opt(row.eventId),
    amount: fromDbNumber(row.amount),
    status: toContractStatus(row.status),
    signedDate: fromDbDateOpt(row.signedDate),
    expirationDate: fromDbDateOpt(row.endDate),
    renewalDate: fromDbDateOpt(row.renewalDate),
    fileName: opt(row.fileName),
    payments: [...row.payments]
      .sort((a, b) => a.position - b.position)
      .map((p) => ({
        id: p.id,
        label: p.label,
        dueDate: fromDbDate(p.dueDate),
        amount: fromDbNumber(p.amount),
        paid: p.paid,
      })),
    deliverables: [...row.deliverables]
      .sort((a, b) => a.position - b.position)
      .map((d) => ({ id: d.id, label: d.label, dueDate: fromDbDate(d.dueDate), done: d.done })),
    summary: hasSummary
      ? {
          overview: row.summaryOverview ?? "",
          keyTerms: row.summaryKeyTerms,
          watchouts: row.summaryWatchouts,
        }
      : undefined,
    notes: opt(row.notes),
    createdAt: row.createdAt.toISOString(),
  };
}

/** A task row as the app's Task (its payment or deliverable becomes contractItemId). */
export function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    dueDate: fromDbDate(row.dueDate),
    completed: row.completed,
    assigneeId: row.assigneeId,
    eventId: opt(row.eventId),
    sponsorId: opt(row.sponsorId),
    contractId: opt(row.agreementId),
    contractItemId: opt(row.paymentId ?? row.deliverableId),
    notes: opt(row.notes),
    startTime: fromDbTime(row.startTime),
    endTime: fromDbTime(row.endTime),
    createdAt: row.createdAt.toISOString(),
  };
}

/** An activity_log row as the app's ActivityEntry. */
export function toActivityEntry(row: ActivityLog): ActivityEntry {
  return {
    id: row.id,
    at: row.at.toISOString(),
    userId: row.userId,
    message: row.message,
    contractId: opt(row.agreementId),
  };
}

// --- App types -> row data ---------------------------------------------------------

/** The event columns the app sets (everything except id, status and created_at). */
export function eventData(event: Omit<ChamberEvent, "id">) {
  return {
    name: event.name,
    startDate: toDbDate(event.startDate),
    endDate: toDbDate(event.endDate),
    startTime: toDbTime(event.startTime),
    endTime: toDbTime(event.startTime ? event.endTime : undefined),
    pillarId: uuidOrNull(event.pillarId),
    isSignature: event.isSignature,
    location: orNull(event.location),
    description: orNull(event.description),
    category: orNull(event.category),
    sponsorName: orNull(event.sponsorName),
    contactEmail: orNull(event.email),
    contactPhone: orNull(event.phone),
    address: orNull(event.address),
    fileName: orNull(event.fileName),
    attendees: event.attendees ?? null,
    sponsorNames: event.sponsorNames ?? [],
    picture: orNull(event.picture),
    deadline: toDbDateOpt(event.deadline),
    priority: event.priority ?? null,
    labels: event.labels ?? [],
    reminders: event.reminders ?? [],
    guests: event.guests ?? [],
    tickets: event.tickets ?? [],
  };
}

/** The event_comp_tickets rows for an event, in list order. */
export function eventCompTicketRows(eventId: string, event: Omit<ChamberEvent, "id">) {
  return (event.compTickets ?? []).map((ticket, position) => ({
    id: ticket.id,
    eventId,
    recipient: ticket.recipient,
    ticketType: ticket.ticketType,
    quantity: ticket.quantity,
    status: ticket.status,
    position,
  }));
}

/** A Partners page comp ticket row as the dialog's CompTicket. */
export function toSponsorCompTicket(row: SponsorCompTicketRow): CompTicket {
  return {
    id: row.id,
    recipient: row.recipient,
    sponsorName: row.sponsorName,
    quantity: row.quantity,
    ticketType: row.ticketType,
    eventName: row.eventName,
    location: row.location,
    plusOne: row.plusOne,
    vipLounge: row.vipLounge,
    backstage: row.backstage,
    notes: row.notes ?? "",
    status: toTicketStatus(row.status),
  };
}

/** The sponsor_comp_tickets columns for a Partners page comp ticket. */
export function sponsorCompTicketData(ticket: CompTicket, sponsorId: string | null) {
  return {
    id: ticket.id,
    sponsorName: ticket.sponsorName,
    sponsorId,
    recipient: ticket.recipient,
    quantity: ticket.quantity,
    ticketType: ticket.ticketType,
    eventName: ticket.eventName,
    location: ticket.location,
    plusOne: ticket.plusOne,
    vipLounge: ticket.vipLounge,
    backstage: ticket.backstage,
    notes: orNull(ticket.notes),
    status: ticket.status,
  };
}

/** What the Settings page shows and saves for the signed-in person. */
export interface ProfileSettings {
  username: string;
  email: string;
  photo: string;
}

/**
 * A profile row as the Settings page values. The display email falls back to
 * the sign-in email until the person saves a different one.
 */
export function toProfileSettings(row: Profile): ProfileSettings {
  return {
    username: row.fullName ?? "",
    email: row.contactEmail ?? row.email ?? "",
    photo: row.avatarUrl ?? "",
  };
}

/** The profile columns the Settings page sets (never the sign-in email). */
export function profileSettingsData(settings: ProfileSettings) {
  return {
    fullName: orNull(settings.username.trim()),
    contactEmail: orNull(settings.email.trim()),
    avatarUrl: orNull(settings.photo),
  };
}

/** The sponsor columns the app sets (to dos are saved separately). */
export function sponsorData(sponsor: Omit<Sponsor, "id">) {
  return {
    name: sponsor.name,
    contactName: orNull(sponsor.contactName),
    contactEmail: orNull(sponsor.contactEmail),
    contactPhone: orNull(sponsor.contactPhone),
    website: orNull(sponsor.website),
    level: orNull(sponsor.level),
    notes: orNull(sponsor.notes),
    // Sponsors saved before statuses existed count as active.
    status: sponsor.status ?? "active",
  };
}

/** The sponsor_todos rows for a sponsor, in list order. */
export function sponsorTodoRows(sponsorId: string, sponsor: Omit<Sponsor, "id">) {
  return (sponsor.todos ?? []).map((todo, position) => ({
    id: todo.id,
    sponsorId,
    title: todo.title,
    done: todo.done,
    position,
  }));
}

/**
 * The task columns the app sets. The payment or deliverable a task mirrors is
 * one id in the app (contractItemId) but two columns in the table, so the
 * caller says which kind it is.
 */
export function taskData(
  task: Omit<Task, "id" | "createdAt" | "completed">,
  itemKind: "payment" | "deliverable" | null
) {
  const itemId = uuidOrNull(task.contractItemId);
  return {
    title: task.title,
    dueDate: toDbDate(task.dueDate),
    startTime: toDbTime(task.startTime),
    endTime: toDbTime(task.startTime ? task.endTime : undefined),
    assigneeId: task.assigneeId,
    eventId: uuidOrNull(task.eventId),
    sponsorId: uuidOrNull(task.sponsorId),
    agreementId: uuidOrNull(task.contractId),
    paymentId: itemKind === "payment" ? itemId : null,
    deliverableId: itemKind === "deliverable" ? itemId : null,
    notes: orNull(task.notes),
  };
}

/** The agreement columns for a new contract (payments and deliverables are saved separately). */
export function contractData(contract: Contract) {
  return {
    id: contract.id,
    title: contract.title,
    sponsorId: contract.sponsorId,
    eventId: uuidOrNull(contract.eventId),
    amount: contract.amount,
    status: contract.status,
    signedDate: toDbDateOpt(contract.signedDate),
    endDate: toDbDateOpt(contract.expirationDate),
    renewalDate: toDbDateOpt(contract.renewalDate),
    fileName: orNull(contract.fileName),
    notes: orNull(contract.notes),
    summaryOverview: contract.summary ? contract.summary.overview : null,
    summaryKeyTerms: contract.summary?.keyTerms ?? [],
    summaryWatchouts: contract.summary?.watchouts ?? [],
    createdAt: new Date(contract.createdAt),
  };
}
