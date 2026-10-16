import { describe, expect, it } from "vitest";

import { dueSoonTasks, overdueTasks, reminderMessage } from "./reminders";
import type { Task } from "./types";

const TODAY = "2025-03-10";

/** Builds a task with sensible defaults so each test only sets what it cares about. */
function task(overrides: Partial<Task>): Task {
  return {
    id: "t1",
    title: "Send invoice",
    dueDate: "2025-03-11",
    completed: false,
    assigneeId: "u1",
    createdAt: "2025-03-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("dueSoonTasks", () => {
  it("includes open tasks due in 1 or 2 days", () => {
    const tasks = [
      task({ id: "a", dueDate: "2025-03-11" }),
      task({ id: "b", dueDate: "2025-03-12" }),
    ];
    expect(dueSoonTasks(tasks, TODAY, "u1").map((t) => t.id)).toEqual(["a", "b"]);
  });

  it("skips tasks due today, in 3+ days, or already overdue", () => {
    const tasks = [
      task({ id: "today", dueDate: "2025-03-10" }),
      task({ id: "later", dueDate: "2025-03-13" }),
      task({ id: "past", dueDate: "2025-03-09" }),
    ];
    expect(dueSoonTasks(tasks, TODAY, "u1")).toEqual([]);
  });

  it("skips completed tasks and tasks for other people", () => {
    const tasks = [
      task({ id: "done", completed: true }),
      task({ id: "other", assigneeId: "u2" }),
    ];
    expect(dueSoonTasks(tasks, TODAY, "u1")).toEqual([]);
  });

  it("works across a month boundary", () => {
    const t = task({ dueDate: "2025-04-01" });
    expect(dueSoonTasks([t], "2025-03-31", "u1")).toEqual([t]);
  });
});

describe("reminderMessage", () => {
  it("says tomorrow for 1 day and in 2 days for 2 days", () => {
    expect(reminderMessage(task({ dueDate: "2025-03-11" }), TODAY)).toBe("Send invoice is due tomorrow.");
    expect(reminderMessage(task({ dueDate: "2025-03-12" }), TODAY)).toBe("Send invoice is due in 2 days.");
  });
});

describe("overdueTasks", () => {
  it("returns open tasks past their due date, oldest first", () => {
    const tasks = [
      task({ id: "newer", dueDate: "2025-03-09" }),
      task({ id: "older", dueDate: "2025-03-01" }),
      task({ id: "today", dueDate: "2025-03-10" }),
      task({ id: "done", dueDate: "2025-03-02", completed: true }),
    ];
    expect(overdueTasks(tasks, TODAY).map((t) => t.id)).toEqual(["older", "newer"]);
  });
});
