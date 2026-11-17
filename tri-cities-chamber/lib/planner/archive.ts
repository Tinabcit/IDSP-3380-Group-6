import { searchTasks, sortByDueDate } from "@/lib/planner/home";
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

/** How many different sponsors and assignees appear across these tasks. */
export function countPeople(tasks: Task[]): number {
  const ids = new Set<string>();
  for (const t of tasks) {
    ids.add(`staff:${t.assigneeId}`);
    if (t.sponsorId) ids.add(`sponsor:${t.sponsorId}`);
  }
  return ids.size;
}
