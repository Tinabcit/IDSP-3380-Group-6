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

export const WEEK_STARTS_ON = 0; // Sunday

export function toISODate(date: Date): ISODate {
  return format(date, 'yyyy-MM-dd');
}

export function fromISODate(value: ISODate): Date {
  return parseISO(value);
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function shiftISODate(value: ISODate, days: number): ISODate {
  return toISODate(addDays(fromISODate(value), days));
}

/** All days shown in a month grid, padded to full weeks. */
export function getMonthGrid(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), {
    weekStartsOn: WEEK_STARTS_ON,
  });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: WEEK_STARTS_ON });
  return eachDayOfInterval({ start, end });
}

export function getWeekdayLabels(): { short: string; long: string }[] {
  const start = startOfWeek(new Date(2024, 0, 3), {
    weekStartsOn: WEEK_STARTS_ON,
  });
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(start, i);
    return { short: format(day, 'EEEEE'), long: format(day, 'EEEE') };
  });
}

export function isISODateBefore(a: ISODate, b: ISODate): boolean {
  return isBefore(startOfDay(fromISODate(a)), startOfDay(fromISODate(b)));
}

export function isISODateAfter(a: ISODate, b: ISODate): boolean {
  return isAfter(startOfDay(fromISODate(a)), startOfDay(fromISODate(b)));
}

/** True if `date` falls within [start, end], inclusive. ISO strings sort lexically. */
export function isWithinISORange(date: ISODate, start: ISODate, end: ISODate): boolean {
  return date >= start && date <= end;
}

export function formatLongDate(value: ISODate): string {
  return format(fromISODate(value), 'EEEE, MMMM d');
}

export function formatShortDate(value: ISODate): string {
  return format(fromISODate(value), 'MMM d');
}

export function describeRelativeDay(value: ISODate, today: ISODate): string {
  if (value === today) return 'Today';
  if (value === shiftISODate(today, 1)) return 'Tomorrow';
  if (value === shiftISODate(today, -1)) return 'Yesterday';
  return format(fromISODate(value), 'EEE, MMM d');
}
