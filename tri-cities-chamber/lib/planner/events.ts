import { format, isValid, parse } from "date-fns";

import type { ChamberEvent, EventCategory, EventInput, ISODate } from "./types";

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
  if (
    input.attendees !== undefined &&
    (!Number.isInteger(input.attendees) || input.attendees < 0)
  ) {
    return "Attendees must be a whole number, 0 or more.";
  }
  return null;
}

/**
 * The values typed in the event form. The same form is used on the Add Event
 * page and in the calendar's add / edit pop-up. Everything is kept as text
 * while typing; formToEventInput turns it into a saved event.
 */
export interface EventFormValues {
  name: string;
  startDate: string;
  /** Blank for a one-day event. */
  endDate: string;
  /** Blank means all day. */
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  isSignature: boolean;
  /** Expected number of people, as typed. Blank means unknown. */
  attendees: string;
  /** One name per sponsor box; people can add as many boxes as they need. */
  sponsors: string[];
  description: string;
}

/** The fields that can show an error message under them. */
export type EventFormErrors = Partial<
  Record<"name" | "startDate" | "endDate" | "endTime" | "attendees", string>
>;

/** An empty form for a new event on the given date. */
export function emptyEventForm(date: string): EventFormValues {
  return {
    name: "",
    startDate: date,
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    category: "other",
    isSignature: false,
    attendees: "",
    sponsors: [""],
    description: "",
  };
}

/** Fills the form from a saved event, so it can be edited. */
export function eventToForm(event: ChamberEvent): EventFormValues {
  const sponsors = event.sponsorNames ?? (event.sponsorName ? [event.sponsorName] : []);
  return {
    name: event.name,
    startDate: event.startDate,
    endDate: event.endDate !== event.startDate ? event.endDate : "",
    startTime: event.startTime ?? "",
    endTime: event.endTime ?? "",
    location: event.location ?? event.address ?? "",
    category: categoryOf(event),
    isSignature: event.isSignature,
    attendees: event.attendees !== undefined ? String(event.attendees) : "",
    sponsors: sponsors.length > 0 ? sponsors : [""],
    description: event.description ?? "",
  };
}

/**
 * Checks the event form. Only the name and date are required. Returns a map of
 * field name to a plain message, empty when everything is fine.
 */
export function validateEventForm(values: EventFormValues): EventFormErrors {
  const errors: EventFormErrors = {};
  if (!values.name.trim()) errors.name = "Enter the event name.";
  if (!values.startDate.trim()) errors.startDate = "Choose the date of the event.";
  else if (!isValidISODate(values.startDate)) errors.startDate = "Choose a real date.";
  if (values.endDate) {
    if (!isValidISODate(values.endDate)) errors.endDate = "Choose a real date.";
    else if (!errors.startDate && values.endDate < values.startDate) {
      errors.endDate = "The last day cannot be before the first day.";
    }
  }
  const oneDay = !values.endDate || values.endDate === values.startDate;
  if (oneDay && values.startTime && values.endTime && values.endTime < values.startTime) {
    errors.endTime = "The end time cannot be before the start time.";
  }
  const attendees = values.attendees.trim();
  if (attendees && (!/^\d+$/.test(attendees))) {
    errors.attendees = "Enter a whole number, like 50.";
  }
  return errors;
}

/**
 * Turns the form into event fields ready to save. Blank optional fields are left
 * out. When editing, `saved` is the event being changed, so details the form does
 * not show (email, phone, the uploaded file and the pillar) are kept. New events
 * get `defaultPillarId`, because pillars are not shown to people.
 */
export function formToEventInput(
  values: EventFormValues,
  saved: ChamberEvent | undefined,
  defaultPillarId: string
): EventInput {
  const sponsors = cleanSponsors(values.sponsors);
  const location = values.location.trim();
  const attendees = values.attendees.trim();
  const startDate = values.startDate as ISODate;
  return {
    name: values.name.trim(),
    startDate,
    endDate: (values.endDate || values.startDate) as ISODate,
    startTime: values.startTime || undefined,
    // An end time means nothing without a start time.
    endTime: values.startTime && values.endTime ? values.endTime : undefined,
    pillarId: saved?.pillarId ?? defaultPillarId,
    isSignature: values.isSignature,
    category: values.category,
    location: location || undefined,
    address: location || undefined,
    attendees: attendees ? Number(attendees) : undefined,
    sponsorNames: sponsors.length > 0 ? sponsors : undefined,
    sponsorName: sponsors.length > 0 ? sponsors.join(", ") : undefined,
    description: values.description.trim() || undefined,
    email: saved?.email,
    phone: saved?.phone,
    fileName: saved?.fileName,
  };
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
