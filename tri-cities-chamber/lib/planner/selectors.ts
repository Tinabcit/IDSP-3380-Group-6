import { isISODateBefore, isWithinISORange, shiftISODate } from "./dates";
import type {
  ChamberEvent,
  ISODate,
  PlannerFilters,
  Task,
  TaskStatus,
} from "./types";

export function getTaskStatus(task: Task, today: ISODate): TaskStatus {
  if (task.completed) return "completed";
  return isISODateBefore(task.dueDate, today) ? "overdue" : "pending";
}

export function hasActiveFilters(filters: PlannerFilters): boolean {
  return (
    filters.signatureOnly ||
    filters.pillarId !== null ||
    filters.sponsorId !== null
  );
}

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

export function eventsOnDate(
  events: ChamberEvent[],
  date: ISODate
): ChamberEvent[] {
  return events.filter((e) => isWithinISORange(date, e.startDate, e.endDate));
}

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

export interface DaySummary {
  events: ChamberEvent[];
  pending: number;
  overdue: number;
  completed: number;
}

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
