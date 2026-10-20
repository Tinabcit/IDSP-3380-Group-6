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
function formatTime(value: string): string {
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
  return null;
}
