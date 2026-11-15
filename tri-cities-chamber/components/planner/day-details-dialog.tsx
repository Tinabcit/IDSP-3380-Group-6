"use client";

import { useMemo, useSyncExternalStore } from "react";
import { addMonths } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatLongDate, fromISODate, toISODate } from "@/lib/planner/dates";
import {
  buildDayDetails,
  formatTimeRange,
  gmtOffsetLabel,
  sumScheduledHours,
  timetableLayout,
} from "@/lib/planner/day-details";
import { CATEGORY_STYLES, categoryOf } from "@/lib/planner/events";
import type { ChamberEvent, ISODate, Task } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

import type { PlannerLookups } from "./lookups";

/** The information DayDetailsDialog needs. */
interface DayDetailsDialogProps {
  /** The day to show, or null when the pop-up is closed. */
  date: ISODate | null;
  events: ChamberEvent[];
  tasks: Task[];
  lookups: PlannerLookups;
  onClose: () => void;
  onChangeDate: (date: ISODate) => void;
  onAddEvent: (date: ISODate) => void;
  onToggle: (id: string) => void;
}

/** Does nothing: the timezone never changes while the page is open. */
const subscribeNever = () => () => {};

/** The browser's offset label, such as "GMT-04:00". */
const getOffsetLabel = (): string =>
  gmtOffsetLabel(new Date().getTimezoneOffset());

/** The server has no timezone to show, so it renders nothing (keeps server and browser pages matching). */
const getServerOffsetLabel = (): string | null => null;

/** Turns a number of hours into text, e.g. 4 into "4" and 2.5 into "2.5". */
function formatHours(hours: number): string {
  return String(Math.round(hours * 10) / 10);
}

/** Turns an hour number into a row label: 9 into "9 AM", 13 into "1 PM". */
function hourLabel(hour: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${hour < 12 ? "AM" : "PM"}`;
}

/**
 * The pop-up that shows everything on one calendar day: counts, the events,
 * the activities (tasks) and an hourly timetable. Times are shown as the
 * user's local time. It only displays what its parent passes in.
 */
export function DayDetailsDialog({
  date,
  events,
  tasks,
  lookups,
  onClose,
  onChangeDate,
  onAddEvent,
  onToggle,
}: DayDetailsDialogProps) {
  const offsetLabel = useSyncExternalStore(
    subscribeNever,
    getOffsetLabel,
    getServerOffsetLabel,
  );

  const day = useMemo(
    () => (date ? buildDayDetails(events, tasks, date) : null),
    [events, tasks, date],
  );
  const layout = useMemo(
    () => (day ? timetableLayout(day.events, day.tasks) : null),
    [day],
  );

  return (
    <Dialog open={date !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl">
        {date && day && layout && (
          <>
            <DialogHeader className="pr-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-6 w-6 text-primary" aria-hidden />
                  <div>
                    <DialogTitle>{formatLongDate(date)}</DialogTitle>
                    <DialogDescription>
                      {fromISODate(date).getFullYear()} - Your events and
                      activities for the day.
                    </DialogDescription>
                  </div>
                </div>
                <Button onClick={() => onAddEvent(date)}>
                  <Plus aria-hidden /> Add event
                </Button>
              </div>
            </DialogHeader>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm">
              <p>
                <strong>{day.events.length}</strong> events
                {" | "}
                <strong>{day.tasks.length}</strong> activities
                {" | "}
                <strong>
                  {formatHours(sumScheduledHours(day.events, day.tasks))}
                </strong>{" "}
                hours scheduled
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous month"
                  onClick={() =>
                    onChangeDate(toISODate(addMonths(fromISODate(date), -1)))
                  }
                >
                  <ChevronLeft />
                </Button>
                <span className="min-w-28 text-center font-medium">
                  {fromISODate(date).toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next month"
                  onClick={() =>
                    onChangeDate(toISODate(addMonths(fromISODate(date), 1)))
                  }
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid content-start gap-5">
                <section aria-labelledby="day-details-events">
                  <h3
                    id="day-details-events"
                    className="mb-2 flex items-center gap-2 font-semibold"
                  >
                    Events <Badge variant="outline">{day.events.length}</Badge>
                  </h3>
                  {day.events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No events on this day.
                    </p>
                  ) : (
                    <ul className="grid gap-2">
                      {day.events.map((event) => (
                        <li
                          key={event.id}
                          className={cn(
                            "rounded-md px-3 py-2.5 text-sm",
                            event.isSignature
                              ? "bg-signature-soft text-signature-foreground"
                              : CATEGORY_STYLES[categoryOf(event)],
                          )}
                        >
                          <p className="text-xs font-medium text-primary">
                            {formatTimeRange(event.startTime, event.endTime)}
                          </p>
                          <p className="font-semibold">{event.name}</p>
                          <p className="text-[13px] opacity-80">
                            {[
                              event.location,
                              event.attendees !== undefined
                                ? `${event.attendees} attendees`
                                : undefined,
                            ]
                              .filter(Boolean)
                              .join(" - ")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section aria-labelledby="day-details-activities">
                  <h3
                    id="day-details-activities"
                    className="mb-2 flex items-center gap-2 font-semibold"
                  >
                    Activities{" "}
                    <Badge variant="outline">
                      {day.completedCount} of {day.tasks.length} complete
                    </Badge>
                  </h3>
                  {day.tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No activities due.
                    </p>
                  ) : (
                    <ul className="grid gap-2">
                      {day.tasks.map((task) => (
                        <li
                          key={task.id}
                          className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => onToggle(task.id)}
                            aria-label={`Mark "${task.title}" ${
                              task.completed ? "not done" : "done"
                            }`}
                          />
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "font-medium",
                                task.completed &&
                                  "text-muted-foreground line-through",
                              )}
                            >
                              {task.title}
                            </p>
                            <p className="text-[13px] text-muted-foreground">
                              {task.startTime
                                ? `${formatTimeRange(task.startTime, task.endTime)} - `
                                : ""}
                              {lookups.staffById.get(task.assigneeId)?.name ??
                                "Unassigned"}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              <section
                aria-labelledby="day-details-timetable"
                className="rounded-md border p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 id="day-details-timetable" className="font-semibold">
                    Timetable
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {offsetLabel}
                  </span>
                </div>
                <div className="relative ml-12" style={{ height: `${(layout.endHour - layout.startHour) * 3.5}rem` }}>
                  {Array.from(
                    { length: layout.endHour - layout.startHour },
                    (_, i) => (
                      <div
                        key={i}
                        className="relative h-14 border-t text-xs text-muted-foreground"
                      >
                        <span className="absolute -left-12 -top-2 w-10 text-right">
                          {hourLabel(layout.startHour + i)}
                        </span>
                      </div>
                    ),
                  )}
                  {layout.blocks.map((block) => (
                    <div
                      key={`${block.kind}-${block.id}`}
                      className={cn(
                        "absolute inset-x-1 overflow-hidden rounded px-2 py-1 text-xs font-medium",
                        block.kind === "event"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                      style={{
                        top: `${block.topPct}%`,
                        height: `${block.heightPct}%`,
                      }}
                    >
                      {block.label}
                    </div>
                  ))}
                </div>
                <ul className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <span aria-hidden className="h-2 w-2 rounded-sm bg-primary/40" />
                    Event
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span aria-hidden className="h-2 w-2 rounded-sm bg-muted-foreground/40" />
                    Activity
                  </li>
                  <li>Local time</li>
                </ul>
              </section>
            </div>

            <DialogFooter className="items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                All times shown in your local timezone.
              </p>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
