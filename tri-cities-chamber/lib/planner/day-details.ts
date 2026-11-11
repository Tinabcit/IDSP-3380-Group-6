/**
 * Pure logic for the calendar day details pop-up: what is on a day,
 * how long it takes, and where it sits on the hourly timetable.
 * Times are zone-less "HH:mm" wall-clock values, shown as the user's local time.
 */

import { eventsOnDate } from "./selectors";
import { formatTime } from "./events";
import type { ChamberEvent, ISODate, Task } from "./types";

/** The hours the timetable shows when nothing falls outside them. */
const DEFAULT_START_HOUR = 9;
const DEFAULT_END_HOUR = 17;

/** Everything the pop-up lists for one day. */
export interface DayDetails {
  events: ChamberEvent[];
  tasks: Task[];
  completedCount: number;
}

/** One coloured block on the timetable, positioned as a percentage of the visible hours. */
export interface TimetableBlock {
  id: string;
  kind: "event" | "task";
  label: string;
  topPct: number;
  heightPct: number;
}

/** The hour rows to draw and the blocks to place on them. */
export interface TimetableLayout {
  startHour: number;
  endHour: number;
  blocks: TimetableBlock[];
}

/** Turns "13:30" into minutes since midnight (810). */
function toMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

/** The AM or PM part of a time like "9:00 AM". */
function meridiemOf(formatted: string): string {
  return formatted.slice(-2);
}

/** Says a time or range: "9:00 - 10:00 AM", "11:00 AM - 1:30 PM", "2:00 PM" or "All day". */
export function formatTimeRange(start?: string, end?: string): string {
  if (!start) return "All day";
  const from = formatTime(start);
  if (!end) return from;
  const to = formatTime(end);
  if (meridiemOf(from) === meridiemOf(to)) return `${from.slice(0, -3)} - ${to}`;
  return `${from} - ${to}`;
}

/** Collects one day's events and tasks (timed tasks first), and how many tasks are done. */
export function buildDayDetails(
  events: ChamberEvent[],
  tasks: Task[],
  date: ISODate
): DayDetails {
  const dayTasks = tasks
    .filter((t) => t.dueDate === date)
    .sort((a, b) => {
      const aTime = a.startTime ?? "99:99";
      const bTime = b.startTime ?? "99:99";
      if (aTime !== bTime) return aTime < bTime ? -1 : 1;
      return a.title.localeCompare(b.title);
    });
  return {
    events: eventsOnDate(events, date),
    tasks: dayTasks,
    completedCount: dayTasks.filter((t) => t.completed).length,
  };
}

/** A start and end that make a real, forward range, or null for all-day and open-ended items. */
function validRange(
  start?: string,
  end?: string
): { start: number; end: number } | null {
  if (!start || !end) return null;
  const range = { start: toMinutes(start), end: toMinutes(end) };
  return range.end > range.start ? range : null;
}

/** Total hours of timed events and tasks (all-day and open-ended items do not count). */
export function sumScheduledHours(events: ChamberEvent[], tasks: Task[]): number {
  const ranges = [
    ...events.map((e) => validRange(e.startTime, e.endTime)),
    ...tasks.map((t) => validRange(t.startTime, t.endTime)),
  ];
  const minutes = ranges.reduce((sum, r) => sum + (r ? r.end - r.start : 0), 0);
  return minutes / 60;
}

/** Works out the visible hours (9 AM to 5 PM, widened to fit) and each block's position. */
export function timetableLayout(
  events: ChamberEvent[],
  tasks: Task[]
): TimetableLayout {
  const items = [
    ...events.map((e) => ({
      id: e.id,
      kind: "event" as const,
      label: e.name,
      range: validRange(e.startTime, e.endTime),
    })),
    ...tasks.map((t) => ({
      id: t.id,
      kind: "task" as const,
      label: t.title,
      range: validRange(t.startTime, t.endTime),
    })),
  ].filter((i) => i.range !== null);

  let startHour = DEFAULT_START_HOUR;
  let endHour = DEFAULT_END_HOUR;
  for (const item of items) {
    startHour = Math.min(startHour, Math.floor(item.range!.start / 60));
    endHour = Math.max(endHour, Math.ceil(item.range!.end / 60));
  }

  const visibleMinutes = (endHour - startHour) * 60;
  const blocks = items.map((item) => ({
    id: item.id,
    kind: item.kind,
    label: item.label,
    topPct: ((item.range!.start - startHour * 60) / visibleMinutes) * 100,
    heightPct: ((item.range!.end - item.range!.start) / visibleMinutes) * 100,
  }));
  return { startHour, endHour, blocks };
}

/** Builds a label like "GMT-04:00" from JavaScript's offset in minutes (positive means behind UTC). */
export function gmtOffsetLabel(offsetMinutes: number): string {
  const ahead = -offsetMinutes;
  const sign = ahead < 0 ? "-" : "+";
  const abs = Math.abs(ahead);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `GMT${sign}${hh}:${mm}`;
}
