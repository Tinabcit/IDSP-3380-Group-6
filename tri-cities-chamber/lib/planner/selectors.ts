import { isISODateBefore, isWithinISORange, shiftISODate } from "./dates";
import type {
  ChamberEvent,
  ISODate,
  PlannerFilters,
  Task,
  TaskStatus,
} from "./types";

/**
 * Works out a task's status: "completed", "overdue" (not done and past its due
 * date) or "pending". It is calculated each time, never saved.
 */
export function getTaskStatus(task: Task, today: ISODate): TaskStatus {
  if (task.completed) return "completed";
  return isISODateBefore(task.dueDate, today) ? "overdue" : "pending";
}

/** True if at least one filter is turned on (used to show "Clear filters"). */
export function hasActiveFilters(filters: PlannerFilters): boolean {
  return (
    filters.signatureOnly ||
    filters.pillarId !== null ||
    filters.sponsorId !== null
  );
}

/**
 * Keeps only the events that match the filters. For the sponsor filter, an event
 * counts if some task connects that sponsor to that event.
 */
export function filterEvents(
  events: ChamberEvent[],
  filters: PlannerFilters,
  tasks: Task[]
): ChamberEvent[] {
  return events.filter((event) => {
    if (filters.signatureOnly && !event.isSignature) return false;
    if (filters.pillarId && event.pillarId !== filters.pillarId) return false;
    if (filters.sponsorId) {
      // An event matches a sponsor if any task links them together.
      const linked = tasks.some(
        (t) => t.eventId === event.id && t.sponsorId === filters.sponsorId
      );
      if (!linked) return false;
    }
    return true;
  });
}

/**
 * Keeps only the tasks that match the filters. The signature and pillar filters
 * check the task's event, so tasks without an event are hidden when they are on.
 */
export function filterTasks(
  tasks: Task[],
  filters: PlannerFilters,
  eventsById: Map<string, ChamberEvent>
): Task[] {
  return tasks.filter((task) => {
    if (filters.sponsorId && task.sponsorId !== filters.sponsorId) return false;
    if (filters.signatureOnly || filters.pillarId) {
      const event = task.eventId ? eventsById.get(task.eventId) : undefined;
      if (!event) return false;
      if (filters.signatureOnly && !event.isSignature) return false;
      if (filters.pillarId && event.pillarId !== filters.pillarId) return false;
    }
    return true;
  });
}

/** Finds the events happening on a date. An event lasting several days shows up on each of those days. */
export function eventsOnDate(
  events: ChamberEvent[],
  date: ISODate
): ChamberEvent[] {
  return events.filter((e) => isWithinISORange(date, e.startDate, e.endDate));
}

/** The order of the statuses in a list (smaller number = comes first). */
const STATUS_ORDER: Record<TaskStatus, number> = {
  overdue: 0,
  pending: 1,
  completed: 2,
};

/** Overdue first, then pending, then completed; ties broken by due date then title. */
export function sortTasks(tasks: Task[], today: ISODate): Task[] {
  return [...tasks].sort((a, b) => {
    const s =
      STATUS_ORDER[getTaskStatus(a, today)] -
      STATUS_ORDER[getTaskStatus(b, today)];
    if (s !== 0) return s;
    if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
}

/** Incomplete tasks that are overdue or due within the next `days` days. */
export function upcomingTasks(
  tasks: Task[],
  today: ISODate,
  days = 7
): Task[] {
  const horizon = shiftISODate(today, days);
  return sortTasks(
    tasks.filter((t) => !t.completed && t.dueDate <= horizon),
    today
  );
}

/** What one calendar day needs to show: its events and how many tasks are overdue, pending and done. */
export interface DaySummary {
  events: ChamberEvent[];
  pending: number;
  overdue: number;
  completed: number;
}

/**
 * Makes a DaySummary for each date in the list (the days on screen). It goes
 * through the tasks only once, which is faster than checking for every day.
 */
export function summarizeByDate(
  events: ChamberEvent[],
  tasks: Task[],
  dates: ISODate[],
  today: ISODate
): Map<ISODate, DaySummary> {
  const map = new Map<ISODate, DaySummary>();
  for (const date of dates) {
    map.set(date, {
      events: eventsOnDate(events, date),
      pending: 0,
      overdue: 0,
      completed: 0,
    });
  }
  for (const task of tasks) {
    const summary = map.get(task.dueDate);
    if (!summary) continue;
    summary[getTaskStatus(task, today)] += 1;
  }
  return map;
}
