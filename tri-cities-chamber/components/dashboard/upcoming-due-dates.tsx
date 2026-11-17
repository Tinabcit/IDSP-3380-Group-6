"use client";

import { useState } from "react";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { FilterSelect } from "@/components/tasks/filter-select";
import { PLAIN_TASK_COLUMNS, TaskTable } from "@/components/tasks/task-table";
import { getUpcomingTasks } from "@/lib/planner/dashboard";
import { cn } from "@/lib/utils";

/** The "Upcoming due dates" section: open tasks due from today on, earliest first, with event and sponsor filters. */
export function UpcomingDueDates() {
  const { today, tasks, events, sponsors, lookups } = usePlannerData();
  const [eventId, setEventId] = useState("all");
  const [sponsorId, setSponsorId] = useState("all");

  const upcoming = getUpcomingTasks(tasks, today, eventId, sponsorId);

  return (
    <section
      aria-label="Upcoming due dates"
      className="flex w-full flex-col gap-4 overflow-x-auto rounded-lg border bg-card p-4 text-card-foreground"
    >
      {/* The header uses the same columns as the rows so the filters sit over the event and sponsor columns. */}
      <header className={cn("grid min-w-[640px] items-start gap-4 px-1", PLAIN_TASK_COLUMNS)}>
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Upcoming due dates</h2>
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{upcoming.length}</span>
          </div>
          <p className="text-xs text-muted-foreground">Open tasks due from today on &middot; Earliest due first</p>
        </div>
        <div>
          <FilterSelect
            label="Filter by event"
            value={eventId}
            onChange={setEventId}
            options={[
              { value: "all", label: "All events" },
              ...events.map((e) => ({ value: e.id, label: e.name })),
            ]}
          />
        </div>
        <div>
          <FilterSelect
            label="Filter by sponsor"
            value={sponsorId}
            onChange={setSponsorId}
            options={[
              { value: "all", label: "All sponsors" },
              ...sponsors.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </div>
      </header>
      <TaskTable
        variant="plain"
        tasks={upcoming}
        today={today}
        eventsById={lookups.eventsById}
        sponsorsById={lookups.sponsorsById}
        emptyMessage="No upcoming tasks."
      />
      <p className="min-w-[640px] border-t px-1 pt-3 text-xs text-muted-foreground">
        {upcoming.length} visible {upcoming.length === 1 ? "task" : "tasks"} shown
      </p>
    </section>
  );
}
