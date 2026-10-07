import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

import type { ISODate } from './types';

/** Which day the calendar week starts on (0 = Sunday). Use 1 for Monday. */
export const WEEK_STARTS_ON = 0; // Sunday

/** Turns a Date into text like "2025-03-07" (in the user's local time). */
export function toISODate(date: Date): ISODate {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Turns text like "2025-03-07" back into a Date. (We use parseISO because
 * new Date("2025-03-07") can show the wrong day in some time zones.)
 */
export function fromISODate(value: ISODate): Date {
  return parseISO(value);
}

/** Today's date as text like "2025-03-07". */
export function todayISO(): ISODate {
  return toISODate(new Date());
}

/** Moves a date forward by `days` (use a negative number to go back). */
export function shiftISODate(value: ISODate, days: number): ISODate {
  return toISODate(addDays(fromISODate(value), days));
}

/**
 * All the days shown in a month calendar, filled out to whole weeks (so it
 * includes a few days from the previous and next month). Used by MonthGrid.
 */
export function getMonthGrid(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), {
    weekStartsOn: WEEK_STARTS_ON,
  });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: WEEK_STARTS_ON });
  return eachDayOfInterval({ start, end });
}

/**
 * The weekday names for the calendar header, e.g. { short: "S", long: "Sunday" },
 * starting from the first day of the week.
 */
export function getWeekdayLabels(): { short: string; long: string }[] {
  const start = startOfWeek(new Date(2024, 0, 3), {
    weekStartsOn: WEEK_STARTS_ON,
  });
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(start, i);
    return { short: format(day, 'EEEEE'), long: format(day, 'EEEE') };
  });
}

/** True if date a is on an earlier day than date b. */
export function isISODateBefore(a: ISODate, b: ISODate): boolean {
  return isBefore(startOfDay(fromISODate(a)), startOfDay(fromISODate(b)));
}

/** True if date a is on a later day than date b. */
export function isISODateAfter(a: ISODate, b: ISODate): boolean {
  return isAfter(startOfDay(fromISODate(a)), startOfDay(fromISODate(b)));
}

/** True if `date` falls within [start, end], inclusive. ISO strings sort lexically. */
export function isWithinISORange(date: ISODate, start: ISODate, end: ISODate): boolean {
  return date >= start && date <= end;
}

/** Formats a date like "Friday, March 7". */
export function formatLongDate(value: ISODate): string {
  return format(fromISODate(value), 'EEEE, MMMM d');
}

/** Formats a date like "Mar 7". */
export function formatShortDate(value: ISODate): string {
  return format(fromISODate(value), 'MMM d');
}

/** Says "Today", "Tomorrow" or "Yesterday" when it fits, otherwise "Fri, Mar 7". */
export function describeRelativeDay(value: ISODate, today: ISODate): string {
  if (value === today) return 'Today';
  if (value === shiftISODate(today, 1)) return 'Tomorrow';
  if (value === shiftISODate(today, -1)) return 'Yesterday';
  return format(fromISODate(value), 'EEE, MMM d');
}
