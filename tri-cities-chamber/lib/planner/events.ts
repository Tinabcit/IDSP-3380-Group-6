import { format, isValid, parse } from "date-fns";

import type {
  ChamberEvent,
  EventCategory,
  EventCompTicket,
  EventInput,
  EventPriority,
  EventReminder,
  ISODate,
} from "./types";

/** Every event category with the label shown to people. The order is the order in dropdowns. */
export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "networking", label: "Networking" },
  { value: "workshop", label: "Workshop" },
  { value: "meeting", label: "Meeting" },
  { value: "fundraiser", label: "Fundraiser" },
  { value: "other", label: "Other" },
];

/**
 * Tailwind classes for each category's chip on the calendar. Colour is never
 * the only cue: the category name is also shown in the day list and as a badge.
 */
export const CATEGORY_STYLES: Record<EventCategory, string> = {
  networking: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100",
  workshop: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  meeting: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-100",
  fundraiser: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  other: "bg-muted text-foreground",
};

/** Every priority a person can pick, in order. */
export const EVENT_PRIORITIES: EventPriority[] = [1, 2, 3, 4, 5, 6];

/** Labels an event can carry. */
export const EVENT_LABELS = ["Design", "Review", "Urgent"];

/** Every reminder option with the words shown to people. */
export const EVENT_REMINDERS: { value: EventReminder; label: string }[] = [
  { value: "day-before", label: "1 day before" },
  { value: "week-before", label: "1 week before" },
  { value: "on-date", label: "On due date" },
];

/** The ticket types an event can offer. */
export const TICKET_TYPES = ["General Admission", "VIP Access", "Press Pass"];

/** The event's category, or "other" for events saved before categories existed. */
export function categoryOf(event: ChamberEvent): EventCategory {
  return event.category ?? "other";
}

/** The label people see for a category, e.g. "Workshop". */
export function categoryLabel(category: EventCategory): string {
  return EVENT_CATEGORIES.find((c) => c.value === category)?.label ?? "Other";
}

/** True for a 24-hour time written "HH:mm", such as "09:30". */
export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/** True for a real calendar date written "yyyy-MM-dd" (rejects "2025-02-29" and "2025-99-99"). */
export function isValidISODate(value: string): value is ISODate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = parse(value, "yyyy-MM-dd", new Date(2000, 0, 1));
  return isValid(parsed) && format(parsed, "yyyy-MM-dd") === value;
}

/** Turns "13:00" into "1:00 PM". */
export function formatTime(value: string): string {
  return format(parse(value, "HH:mm", new Date(2000, 0, 1)), "h:mm a");
}

/** Says when an event happens in the day: "All day", "9:00 AM" or "1:00 PM - 3:30 PM". */
export function formatEventTime(event: ChamberEvent): string {
  if (!event.startTime) return "All day";
  if (!event.endTime) return formatTime(event.startTime);
  return `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
}

/** Sort order for one day's list: all-day first, then by start time, then by name. */
export function compareEvents(a: ChamberEvent, b: ChamberEvent): number {
  const aTime = a.startTime ?? "";
  const bTime = b.startTime ?? "";
  if (aTime !== bTime) return aTime < bTime ? -1 : 1;
  return a.name.localeCompare(b.name);
}

/**
 * Checks the values from the event form. Returns a sentence to show the user,
 * or null when everything is fine.
 */
export function validateEventInput(input: EventInput): string | null {
  if (!input.name.trim()) return "Enter an event name.";
  if (!isValidISODate(input.startDate)) return "Pick a valid start date.";
  if (!isValidISODate(input.endDate)) return "Pick a valid end date.";
  if (input.endDate < input.startDate) return "The end date cannot be before the start date.";
  if (input.startTime && !isValidTime(input.startTime)) return "Enter a valid start time.";
  if (input.endTime && !isValidTime(input.endTime)) return "Enter a valid end time.";
  if (
    input.startTime &&
    input.endTime &&
    input.startDate === input.endDate &&
    input.endTime < input.startTime
  ) {
    return "The end time cannot be before the start time.";
  }
  if (input.deadline && !isValidISODate(input.deadline)) return "Pick a valid deadline.";
  if (input.priority !== undefined && !EVENT_PRIORITIES.includes(input.priority)) {
    return "Pick a priority from P1 to P6.";
  }
  if (input.compTickets?.some((t) => !Number.isInteger(t.quantity) || t.quantity < 1)) {
    return "Each comp ticket needs a whole number of tickets, 1 or more.";
  }
  if (
    input.attendees !== undefined &&
    (!Number.isInteger(input.attendees) || input.attendees < 0)
  ) {
    return "Attendees must be a whole number, 0 or more.";
  }
  return null;
}

/** The values typed on the Add Event page. */
export interface EventFormValues {
  title: string;
  /** One name per sponsor box; the page lets people add as many as they need. */
  sponsors: string[];
  date: string;
  /** A signature event (or event series) is the only kind that picks a category. */
  isSignature: boolean;
  category: string;
  address: string;
}

/** Trims sponsor names and drops blanks and repeats (ignoring case), keeping the order. */
export function cleanSponsors(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of names) {
    const name = raw.trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push(name);
  }
  return out;
}

/**
 * Checks the Add Event page. Title, date, address and at least one sponsor are
 * required; the category only when the event is a signature event. Returns a map
 * of field name to message, empty when everything is fine.
 */
export function validateEventForm(values: EventFormValues): Partial<Record<keyof EventFormValues, string>> {
  const errors: Partial<Record<keyof EventFormValues, string>> = {};
  const required = "Field Required";
  if (!values.title.trim()) errors.title = required;
  if (cleanSponsors(values.sponsors).length === 0) errors.sponsors = required;
  if (!values.date.trim()) errors.date = required;
  else if (!isValidISODate(values.date)) errors.date = "Pick a valid date.";
  if (values.isSignature && !values.category.trim()) errors.category = required;
  if (!values.address.trim()) errors.address = required;
  return errors;
}

/** The extra fields shared by the Add Event page and the edit pop-up, as the forms hold them. */
export interface EventExtras {
  picture: string;
  description: string;
  deadline: string;
  priority: EventPriority | null;
  labels: string[];
  reminders: EventReminder[];
  guests: string[];
  tickets: string[];
  compTickets: EventCompTicket[];
}

/** The extras of an event, or empty extras for a new one. */
export function extrasFromEvent(event: ChamberEvent | undefined): EventExtras {
  return {
    picture: event?.picture ?? "",
    description: event?.description ?? "",
    deadline: event?.deadline ?? "",
    priority: event?.priority ?? null,
    labels: event?.labels ?? [],
    reminders: event?.reminders ?? [],
    guests: event?.guests ?? [],
    tickets: event?.tickets ?? [],
    compTickets: event?.compTickets ?? [],
  };
}

/** Turns form extras into event fields, leaving out anything blank so saved events stay small. */
export function extrasToInput(extras: EventExtras): Partial<EventInput> {
  const list = <T,>(items: T[]) => (items.length > 0 ? items : undefined);
  return {
    picture: extras.picture || undefined,
    description: extras.description.trim() || undefined,
    deadline: extras.deadline || undefined,
    priority: extras.priority ?? undefined,
    labels: list(extras.labels),
    reminders: list(extras.reminders),
    guests: list(extras.guests),
    tickets: list(extras.tickets),
    compTickets: list(extras.compTickets),
  };
}

/** Adds the item to the list, or removes it when it is already there. */
export function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

/** The first letters of the first two words of a name, e.g. "Alice Ross" gives "AR". */
export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/** The numbers shown above the comp ticket table. Only issued tickets count as issued. */
export function compTicketStats(tickets: EventCompTicket[]): {
  recipients: number;
  issued: number;
  byType: Record<string, number>;
} {
  const issuedTickets = tickets.filter((t) => t.status === "Issued");
  const byType: Record<string, number> = {};
  for (const t of issuedTickets) byType[t.ticketType] = (byType[t.ticketType] ?? 0) + t.quantity;
  return {
    recipients: new Set(tickets.map((t) => t.recipient.trim().toLowerCase())).size,
    issued: issuedTickets.reduce((sum, t) => sum + t.quantity, 0),
    byType,
  };
}
