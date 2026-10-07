"use client";

import type { ISODate, Task } from "@/lib/planner/types";

import type { PlannerLookups } from "./lookups";
import { TaskItem } from "./task-item";

interface UpcomingPanelProps {
  today: ISODate;
  tasks: Task[];
  lookups: PlannerLookups;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onShowDate: (date: ISODate) => void;
}

export function UpcomingPanel({
  today,
  tasks,
  lookups,
  onToggle,
  onEdit,
  onDelete,
  onShowDate,
}: UpcomingPanelProps) {
  return (
    <section aria-labelledby="upcoming-heading" className="grid gap-3">
      <div>
        <h2 id="upcoming-heading" className="text-xl font-bold">
          Coming up
        </h2>
        <p className="text-sm text-muted-foreground">
          Overdue and due in the next 7 days.
        </p>
      </div>
      {tasks.length > 0 ? (
        <ul aria-label="Upcoming tasks" className="grid gap-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              today={today}
              lookups={lookups}
              showDueDate
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onShowDate={onShowDate}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Nothing due this week.
        </p>
      )}
    </section>
  );
}
