"use client";

import { CalendarDays, Pencil, Trash2 } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { describeRelativeDay } from "@/lib/planner/dates";
import { getTaskStatus } from "@/lib/planner/selectors";
import type { ISODate, Task } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

import type { PlannerLookups } from "./lookups";

interface TaskItemProps {
  task: Task;
  today: ISODate;
  lookups: PlannerLookups;
  /** Show the due date (used in lists that span several days). */
  showDueDate?: boolean;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onShowDate?: (date: ISODate) => void;
}

export function TaskItem({
  task,
  today,
  lookups,
  showDueDate = false,
  onToggle,
  onEdit,
  onDelete,
  onShowDate,
}: TaskItemProps) {
  const status = getTaskStatus(task, today);
  const event = task.eventId ? lookups.eventsById.get(task.eventId) : undefined;
  const sponsor = task.sponsorId
    ? lookups.sponsorsById.get(task.sponsorId)
    : undefined;
  const assignee = lookups.staffById.get(task.assigneeId);
  const checkboxId = `task-${task.id}`;

  return (
    <li
      className={cn(
        "group flex gap-3 rounded-md border-l-[3px] bg-card py-3 pl-3 pr-1",
        status === "overdue" && "border-l-overdue",
        status === "pending" && "border-l-primary/70",
        status === "completed" && "border-l-done/60"
      )}
    >
      <Checkbox
        id={checkboxId}
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        aria-label={
          task.completed
            ? `Mark "${task.title}" as not done`
            : `Mark "${task.title}" as done`
        }
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <label
            htmlFor={checkboxId}
            className={cn(
              "cursor-pointer text-[15px] font-medium leading-snug",
              task.completed && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </label>
          {status === "overdue" && <Badge variant="overdue">Overdue</Badge>}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
          {showDueDate &&
            (onShowDate ? (
              <button
                type="button"
                onClick={() => onShowDate(task.dueDate)}
                className={cn(
                  "inline-flex items-center gap-1 rounded underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  status === "overdue" && "font-medium text-overdue"
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {describeRelativeDay(task.dueDate, today)}
              </button>
            ) : (
              <span>{describeRelativeDay(task.dueDate, today)}</span>
            ))}
          {assignee && (
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground"
              >
                {assignee.initials}
              </span>
              {assignee.name}
            </span>
          )}
          {event && (
            <span className="inline-flex items-center gap-1">
              {event.isSignature && (
                <span
                  aria-label="Signature event"
                  className="h-2 w-2 rounded-full bg-signature"
                />
              )}
              {event.name}
            </span>
          )}
          {sponsor && <span>{sponsor.name}</span>}
        </div>

        {task.notes && !task.completed && (
          <p className="mt-1.5 line-clamp-2 text-[13px] text-muted-foreground">
            {task.notes}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-start">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          className="text-muted-foreground hover:text-foreground"
        >
          <Pencil />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete "${task.title}"`}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this task?</AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{task.title}&rdquo; will be removed for everyone. This
                can&rsquo;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep task</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(task.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete task
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}
