import { isISODateBefore, shiftISODate } from "@/lib/planner/dates";
import { sortByDueDate } from "@/lib/planner/home";
import type { Contract, ISODate, Task } from "@/lib/planner/types";

/** One uploaded contract file, ready to show as a row. */
export interface UploadedDoc {
  id: string;
  fileName: string;
  /** Upper-case file extension such as "PDF", or "FILE" when the name has none. */
  type: string;
  /** The day the contract (and its file) was added. */
  addedOn: ISODate;
}

/** Lists the contracts that have an uploaded file, newest first. */
export function getUploadedDocuments(contracts: Contract[]): UploadedDoc[] {
  return contracts
    .filter((c): c is Contract & { fileName: string } => Boolean(c.fileName))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((c) => {
      const ext = c.fileName.includes(".") ? c.fileName.split(".").pop() : "";
      return {
        id: c.id,
        fileName: c.fileName,
        type: ext ? ext.toUpperCase() : "FILE",
        addedOn: c.createdAt.slice(0, 10),
      };
    });
}

/** How many tasks are due on one day. */
export interface TasksOnDay {
  date: ISODate;
  count: number;
}

/** Counts the tasks due on each of `days` days in a row, starting on `start`. */
export function getTasksPerDay(tasks: Task[], start: ISODate, days = 10): TasksOnDay[] {
  return Array.from({ length: days }, (_, i) => {
    const date = shiftISODate(start, i);
    return { date, count: tasks.filter((t) => t.dueDate === date).length };
  });
}

/**
 * Every open task due today or later, however far away, earliest first.
 * "all" for event or sponsor means no filter.
 */
export function getUpcomingTasks(
  tasks: Task[],
  today: ISODate,
  eventId = "all",
  sponsorId = "all",
): Task[] {
  const upcoming = tasks.filter((t) => {
    if (t.completed || isISODateBefore(t.dueDate, today)) return false;
    if (eventId !== "all" && t.eventId !== eventId) return false;
    if (sponsorId !== "all" && t.sponsorId !== sponsorId) return false;
    return true;
  });
  return sortByDueDate(upcoming, "asc");
}
