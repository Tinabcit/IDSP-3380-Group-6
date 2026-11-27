import { isISODateBefore, shiftISODate } from "./dates";
import type { ChamberEvent, ISODate, Sponsor, Task } from "./types";

/** One page of a list, plus which page it is and how many pages there are. */
export interface Page<T> {
  items: T[];
  page: number;
  pageCount: number;
}

/**
 * Cuts a list into pages. Page numbers start at 0. A page number that is too
 * big or too small is moved to the nearest real page, and an empty list still
 * has one (empty) page.
 */
export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 0), pageCount - 1);
  const start = safePage * pageSize;
  return { items: items.slice(start, start + pageSize), page: safePage, pageCount };
}

/**
 * Keeps the tasks whose title, event name or sponsor name contains the search
 * text (ignoring upper/lower case). A blank search keeps everything.
 */
export function searchTasks(
  tasks: Task[],
  query: string,
  eventsById: Map<string, ChamberEvent>,
  sponsorsById: Map<string, Sponsor>
): Task[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return tasks;
  return tasks.filter((task) => {
    const event = task.eventId ? eventsById.get(task.eventId) : undefined;
    const sponsor = task.sponsorId ? sponsorsById.get(task.sponsorId) : undefined;
    return [task.title, event?.name, sponsor?.name].some((text) =>
      text?.toLowerCase().includes(needle)
    );
  });
}

/** Sorts tasks by due date, oldest first ("asc") or newest first ("desc"). Returns a new list. */
export function sortByDueDate(tasks: Task[], direction: "asc" | "desc"): Task[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...tasks].sort((a, b) => {
    if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -sign : sign;
    return a.title.localeCompare(b.title);
  });
}

/** Events split into the two groups used everywhere: upcoming and past. */
export interface EventGroups {
  upcoming: ChamberEvent[];
  past: ChamberEvent[];
}

/**
 * Splits events into "upcoming" (not finished yet, soonest first) and "past"
 * (finished, most recent first). The sidebar and the Events page both use it.
 */
export function splitEvents(events: ChamberEvent[], today: ISODate): EventGroups {
  const byStart = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return {
    upcoming: byStart.filter((e) => !isISODateBefore(e.endDate, today)),
    past: byStart.filter((e) => isISODateBefore(e.endDate, today)).reverse(),
  };
}

/** The small coloured label next to an event in the sidebar. */
export interface EventBadge {
  text: string;
  tone: "danger" | "info" | "dark";
}

/**
 * Picks the label for an event in the sidebar. An event starting within a week
 * says when ("today", "in 2 days", "in 1 week") in red. Otherwise it shows how
 * many tasks are still open (blue), or "low priority" (dark) if none are.
 */
export function eventBadge(event: ChamberEvent, openTasks: number, today: ISODate): EventBadge {
  if (!isISODateBefore(event.startDate, today) && event.startDate <= shiftISODate(today, 7)) {
    const days = Math.round(
      (Date.parse(event.startDate) - Date.parse(today)) / (24 * 60 * 60 * 1000)
    );
    const text = days === 0 ? "today" : days === 7 ? "in 1 week" : `in ${days} ${days === 1 ? "day" : "days"}`;
    return { text, tone: "danger" };
  }
  if (openTasks > 0) {
    return { text: `${openTasks} ${openTasks === 1 ? "task" : "tasks"}`, tone: "info" };
  }
  return { text: "low priority", tone: "dark" };
}
