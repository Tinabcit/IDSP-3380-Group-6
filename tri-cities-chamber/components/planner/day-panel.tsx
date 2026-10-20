"use client";

import { Clock, MapPin, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatLongDate } from "@/lib/planner/dates";
import { CATEGORY_STYLES, categoryLabel, categoryOf, formatEventTime } from "@/lib/planner/events";
import type { ChamberEvent, ISODate, Task } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

import type { PlannerLookups } from "./lookups";
import { TaskItem } from "./task-item";

/** The information DayPanel needs. */
interface DayPanelProps {
  date: ISODate;
  today: ISODate;
  events: ChamberEvent[];
  tasks: Task[];
  lookups: PlannerLookups;
  onAddTask: (date: ISODate) => void;
  onAddEvent: (date: ISODate) => void;
  onEditEvent: (event: ChamberEvent) => void;
  onDeleteEvent: (id: string) => void;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

/**
 * The side panel for the selected day. Shows that day's events (with edit and
 * delete), its tasks (using TaskItem) and "Add event" / "Add task" buttons.
 * The data is already filtered by PlannerApp before it gets here.
 */
export function DayPanel({
  date,
  today,
  events,
  tasks,
  lookups,
  onAddTask,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
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
        <div className="flex flex-wrap justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => onAddEvent(date)}>
            <Plus />
            Add event
          </Button>
          <Button size="sm" variant="outline" onClick={() => onAddTask(date)}>
            <Plus />
            Add task
          </Button>
        </div>
      </div>

      {events.length === 0 && (
        <p className="text-sm text-muted-foreground">No events on this day.</p>
      )}

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
                    : CATEGORY_STYLES[categoryOf(event)]
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{event.name}</span>
                      {event.isSignature && (
                        <Badge className="bg-signature text-signature-foreground">
                          Signature
                        </Badge>
                      )}
                      <Badge variant="outline" className="bg-background/60">
                        {categoryLabel(categoryOf(event))}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-[13px] opacity-80">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {formatEventTime(event)}
                      </span>
                      {pillar && <span>{pillar.name}</span>}
                      {event.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          {event.location}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-1 text-[13px] opacity-80">{event.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${event.name}`}
                      onClick={() => onEditEvent(event)}
                    >
                      <Pencil />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${event.name}`}>
                          <Trash2 />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                          <AlertDialogDescription>
                            &ldquo;{event.name}&rdquo; will be removed for everyone. Tasks and
                            contracts linked to it are kept but no longer tied to an event.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep event</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteEvent(event.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete event
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
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
