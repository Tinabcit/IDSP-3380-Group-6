import { describe, expect, it } from "vitest";
import {
  buildDayDetails,
  formatTimeRange,
  gmtOffsetLabel,
  sumScheduledHours,
  timetableLayout,
} from "./day-details";
import type { ChamberEvent, Task } from "./types";

/** Builds an event with sensible defaults so each test only sets what it cares about. */
function makeEvent(over: Partial<ChamberEvent> = {}): ChamberEvent {
  return {
    id: "e1",
    name: "Mixer",
    startDate: "2026-10-27",
    endDate: "2026-10-27",
    pillarId: "p1",
    isSignature: false,
    ...over,
  };
}

/** Builds a task with sensible defaults so each test only sets what it cares about. */
function makeTask(over: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "Send invoice",
    dueDate: "2026-10-27",
    completed: false,
    assigneeId: "s1",
    createdAt: "2026-10-01T00:00:00.000Z",
    ...over,
  };
}

describe("formatTimeRange", () => {
  it("shares the meridiem when both times are in the same half of the day", () => {
    expect(formatTimeRange("09:00", "10:00")).toBe("9:00 - 10:00 AM");
  });

  it("shows both meridiems when the range crosses noon", () => {
    expect(formatTimeRange("11:00", "13:30")).toBe("11:00 AM - 1:30 PM");
  });

  it("shows a single time when there is no end", () => {
    expect(formatTimeRange("14:00")).toBe("2:00 PM");
  });

  it("says All day when there is no start", () => {
    expect(formatTimeRange(undefined)).toBe("All day");
  });
});

describe("buildDayDetails", () => {
  it("keeps only the events and tasks on the date", () => {
    const events = [makeEvent(), makeEvent({ id: "e2", startDate: "2026-10-28", endDate: "2026-10-28" })];
    const tasks = [makeTask(), makeTask({ id: "t2", dueDate: "2026-10-28" })];
    const day = buildDayDetails(events, tasks, "2026-10-27");
    expect(day.events.map((e) => e.id)).toEqual(["e1"]);
    expect(day.tasks.map((t) => t.id)).toEqual(["t1"]);
  });

  it("counts completed tasks", () => {
    const tasks = [makeTask({ completed: true }), makeTask({ id: "t2" })];
    expect(buildDayDetails([], tasks, "2026-10-27").completedCount).toBe(1);
  });

  it("returns empty lists for an empty day", () => {
    const day = buildDayDetails([], [], "2026-10-27");
    expect(day.events).toEqual([]);
    expect(day.tasks).toEqual([]);
    expect(day.completedCount).toBe(0);
  });
});

describe("sumScheduledHours", () => {
  it("adds up timed events and timed tasks", () => {
    const events = [makeEvent({ startTime: "09:00", endTime: "10:30" })];
    const tasks = [makeTask({ startTime: "13:00", endTime: "14:00" })];
    expect(sumScheduledHours(events, tasks)).toBe(2.5);
  });

  it("ignores all-day items and items with no end time", () => {
    const events = [makeEvent(), makeEvent({ id: "e2", startTime: "09:00" })];
    expect(sumScheduledHours(events, [makeTask()])).toBe(0);
  });

  it("ignores ranges that end before they start", () => {
    const events = [makeEvent({ startTime: "10:00", endTime: "09:00" })];
    expect(sumScheduledHours(events, [])).toBe(0);
  });
});

describe("timetableLayout", () => {
  it("defaults to 9 AM through 5 PM when nothing is scheduled", () => {
    const layout = timetableLayout([], []);
    expect(layout.startHour).toBe(9);
    expect(layout.endHour).toBe(17);
    expect(layout.blocks).toEqual([]);
  });

  it("positions a block as a percentage of the visible hours", () => {
    const events = [makeEvent({ startTime: "10:00", endTime: "11:00" })];
    const layout = timetableLayout(events, []);
    // 8 visible hours: 10:00 is 1 hour in, and the block is 1 hour tall.
    expect(layout.blocks).toHaveLength(1);
    expect(layout.blocks[0].kind).toBe("event");
    expect(layout.blocks[0].topPct).toBeCloseTo(12.5);
    expect(layout.blocks[0].heightPct).toBeCloseTo(12.5);
  });

  it("widens the range to fit early and late items", () => {
    const tasks = [makeTask({ startTime: "07:30", endTime: "08:00" })];
    const events = [makeEvent({ startTime: "18:00", endTime: "19:15" })];
    const layout = timetableLayout(events, tasks);
    expect(layout.startHour).toBe(7);
    expect(layout.endHour).toBe(20);
  });

  it("leaves untimed and open-ended items off the grid", () => {
    const events = [makeEvent(), makeEvent({ id: "e2", startTime: "09:00" })];
    expect(timetableLayout(events, [makeTask()]).blocks).toEqual([]);
  });
});

describe("gmtOffsetLabel", () => {
  it("formats a negative offset", () => {
    expect(gmtOffsetLabel(240)).toBe("GMT-04:00");
  });

  it("formats a positive offset", () => {
    expect(gmtOffsetLabel(-330)).toBe("GMT+05:30");
  });

  it("formats zero", () => {
    expect(gmtOffsetLabel(0)).toBe("GMT+00:00");
  });
});
