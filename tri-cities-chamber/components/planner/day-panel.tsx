"use client";

import { MapPin, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLongDate } from "@/lib/planner/dates";
import type { ChamberEvent, ISODate, Task } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

import type { PlannerLookups } from "./lookups";
import { TaskItem } from "./task-item";

interface DayPanelProps {
  date: ISODate;
  today: ISODate;
  events: ChamberEvent[];
  tasks: Task[];
  lookups: PlannerLookups;
  onAddTask: (date: ISODate) => void;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function DayPanel({
  date,
  today,
  events,
  tasks,
  lookups,
  onAddTask,
  onToggle,
  onEdit,
  onDelete,
}: DayPanelProps) {
  const done = tasks.filter((t) => t.completed).length;
  const isToday = date === today;

  return (
    <section aria-labelledby="day-panel-heading" className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="day-panel-heading" className="text-xl font-bold">
            {isToday ? "Today" : formatLongDate(date)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isToday && <>{formatLongDate(date)}. </>}
            {tasks.length === 0
              ? "No tasks due."
              : `${tasks.length} task${tasks.length > 1 ? "s" : ""}, ${done} done.`}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => onAddTask(date)}>
          <Plus />
          Add task
        </Button>
      </div>

      {events.length > 0 && (
        <ul aria-label="Events" className="grid gap-2">
          {events.map((event) => {
            const pillar = lookups.pillarsById.get(event.pillarId);
            return (
              <li
                key={event.id}
                className={cn(
                  "rounded-md px-3 py-2.5",
                  event.isSignature
                    ? "bg-signature-soft text-signature-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{event.name}</span>
                  {event.isSignature && (
                    <Badge className="bg-signature text-signature-foreground">
                      Signature
                    </Badge>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-[13px] opacity-80">
                  {pillar && <span>{pillar.name}</span>}
                  {event.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {event.location}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {tasks.length > 0 ? (
        <ul aria-label="Tasks" className="grid gap-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              today={today}
              lookups={lookups}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      ) : (
        <div className="rounded-md border border-dashed px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing is due on this day.
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => onAddTask(date)}
            className="mt-1"
          >
            Add a task for this day
          </Button>
        </div>
      )}
    </section>
  );
}
