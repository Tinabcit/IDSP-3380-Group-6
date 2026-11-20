import { searchTasks, sortByDueDate } from "@/lib/planner/tasks";
import type { ChamberEvent, Sponsor, Task } from "@/lib/planner/types";

/**
 * Completed tasks, latest due date first. Optional filters: a search over the task title,
 * event name and sponsor name, plus an event id and a sponsor id ("all" means no filter).
 */
export function getCompletedTasks(
  tasks: Task[],
  eventsById: Map<string, ChamberEvent>,
  sponsorsById: Map<string, Sponsor>,
  query = "",
  eventId = "all",
  sponsorId = "all",
): Task[] {
  const done = tasks.filter(
    (t) =>
      t.completed &&
      (eventId === "all" || t.eventId === eventId) &&
      (sponsorId === "all" || t.sponsorId === sponsorId),
  );
  return sortByDueDate(searchTasks(done, query, eventsById, sponsorsById), "desc");
}

/** How many different events appear across these tasks. Tasks with no event are skipped. */
export function countEvents(tasks: Task[]): number {
  return new Set(tasks.flatMap((t) => (t.eventId ? [t.eventId] : []))).size;
}

/** How many different sponsors appear across these tasks. Tasks with no sponsor are skipped. */
export function countSponsors(tasks: Task[]): number {
  return new Set(tasks.flatMap((t) => (t.sponsorId ? [t.sponsorId] : []))).size;
}
