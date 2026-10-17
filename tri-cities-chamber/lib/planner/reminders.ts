import { isISODateBefore, shiftISODate } from "./dates";
import type { ISODate, Task } from "./types";

/** How many days ahead a task triggers a reminder (1 or 2 days before it is due). */
export const REMINDER_DAYS = [1, 2] as const;

/**
 * The tasks that should trigger a reminder today: not done, assigned to this
 * person, and due tomorrow or the day after. Overdue and due-today tasks are
 * left out (the calendar already highlights those).
 */
export function dueSoonTasks(tasks: Task[], today: ISODate, userId: string): Task[] {
  const dates = REMINDER_DAYS.map((days) => shiftISODate(today, days));
  return tasks.filter((t) => !t.completed && t.assigneeId === userId && dates.includes(t.dueDate));
}

/** The sentence shown in the reminder toast, e.g. "Send invoice is due tomorrow." */
export function reminderMessage(task: Task, today: ISODate): string {
  const when = task.dueDate === shiftISODate(today, 1) ? "tomorrow" : "in 2 days";
  return `${task.title} is due ${when}.`;
}

/** Every open task whose due date has passed, oldest first. Powers the header bell. */
export function overdueTasks(tasks: Task[], today: ISODate): Task[] {
  return tasks
    .filter((t) => !t.completed && isISODateBefore(t.dueDate, today))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title));
}
