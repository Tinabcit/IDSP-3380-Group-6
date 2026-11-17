"use client";

import Link from "next/link";
import { ArrowUpDown, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatLongDate, formatOrdinalDate } from "@/lib/planner/dates";
import { getTaskStatus } from "@/lib/planner/selectors";
import type { ChamberEvent, ISODate, Sponsor, Task } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

/** Optional tick boxes: pass this to let people select rows. */
export interface TaskTableSelection {
  selected: Set<string>;
  allSelected: boolean;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
}

/** Optional sorting: pass this to make the Due Date heading a sort button. */
export interface TaskTableSort {
  direction: "asc" | "desc";
  onToggle: () => void;
}

/**
 * Column widths of the "plain" layout: date, task, event, sponsor. Exported so a header above the
 * table (like the dashboard's filters) can use the same grid and line up with the columns.
 */
export const PLAIN_TASK_COLUMNS = "grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]";

interface TaskTableProps {
  /** "table" is the full table (home page). "plain" is simple rows with no header (dashboard). */
  variant?: "table" | "plain";
  /** The rows to show. The parent does the filtering, sorting and paging. */
  tasks: Task[];
  today: ISODate;
  eventsById: Map<string, ChamberEvent>;
  sponsorsById: Map<string, Sponsor>;
  selection?: TaskTableSelection;
  sort?: TaskTableSort;
  /** When given, clicking a task name calls this (the home page opens the task details pop-up). */
  onViewDetails?: (task: Task) => void;
  /** Show the calendar link at the end of each row. Defaults to true. */
  showActions?: boolean;
  emptyMessage?: string;
}

/**
 * The task table shared by the home page and the dashboard. It only shows what its parent passes in.
 * Tick boxes and sorting turn on only when `selection` / `sort` are given.
 */
export function TaskTable({
  variant = "table",
  tasks,
  today,
  eventsById,
  sponsorsById,
  selection,
  sort,
  onViewDetails,
  showActions = true,
  emptyMessage = "No tasks match these filters.",
}: TaskTableProps) {
  if (variant === "plain") {
    return (
      <ul className="min-w-[640px]">
        {tasks.length === 0 && (
          <li className="border-t px-1 py-8 text-center text-sm text-muted-foreground">{emptyMessage}</li>
        )}
        {tasks.map((t) => (
          <li key={t.id} className={cn("grid items-center gap-4 border-t px-1 py-3 text-sm", PLAIN_TASK_COLUMNS)}>
            <span>{formatOrdinalDate(t.dueDate)}</span>
            <span className={cn("truncate", t.completed && "text-muted-foreground line-through")}>{t.title}</span>
            <NameCell name={t.eventId ? eventsById.get(t.eventId)?.name : undefined} />
            <NameCell name={t.sponsorId ? sponsorsById.get(t.sponsorId)?.name : undefined} />
          </li>
        ))}
      </ul>
    );
  }

  const columnCount = 4 + (selection ? 1 : 0) + (showActions ? 1 : 0);
  const head = "h-auto px-3 py-2 font-semibold text-foreground";

  return (
    <Card className="overflow-hidden bg-transparent">
      <Table className="min-w-[640px] text-left">
        <TableHeader className="bg-muted">
          <TableRow className="hover:bg-transparent">
            {selection && (
              <TableHead className="h-auto w-10 px-3 py-2 text-foreground">
                <Checkbox
                  aria-label="Select all rows on this page"
                  checked={selection.allSelected}
                  onCheckedChange={selection.onToggleAll}
                  className="rounded-[4px] data-[checked]:border-sky-600 data-[checked]:bg-sky-600"
                />
              </TableHead>
            )}
            <TableHead className={head}>Tu Do Task Name</TableHead>
            <TableHead className={head}>Event</TableHead>
            <TableHead className={head}>Sponsor</TableHead>
            <TableHead className={cn(head, "text-xs")}>
              {sort ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={sort.onToggle}
                  className="h-auto gap-1 rounded p-0 text-xs font-semibold hover:bg-transparent [&_svg]:size-3"
                >
                  Due Date
                  <ArrowUpDown className="h-3 w-3" aria-hidden />
                  <span className="sr-only">
                    , sorted {sort.direction === "asc" ? "oldest first" : "newest first"}
                  </span>
                </Button>
              ) : (
                "Due Date"
              )}
            </TableHead>
            {showActions && (
              <TableHead className="h-auto w-8 px-3 py-2 text-foreground">
                <span className="sr-only">Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columnCount}
                className="px-3 py-10 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
          {tasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              today={today}
              checked={selection?.selected.has(t.id)}
              onToggle={selection ? () => selection.onToggleRow(t.id) : undefined}
              onViewDetails={onViewDetails ? () => onViewDetails(t) : undefined}
              eventName={t.eventId ? eventsById.get(t.eventId)?.name : undefined}
              sponsorName={t.sponsorId ? sponsorsById.get(t.sponsorId)?.name : undefined}
              showActions={showActions}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

/** One row: optional tick box, task name, event, sponsor, due date (red when overdue) and an optional calendar link. */
function TaskRow({
  task,
  today,
  checked,
  onToggle,
  onViewDetails,
  eventName,
  sponsorName,
  showActions,
}: {
  task: Task;
  today: ISODate;
  checked?: boolean;
  onToggle?: () => void;
  onViewDetails?: () => void;
  eventName?: string;
  sponsorName?: string;
  showActions: boolean;
}) {
  const overdue = getTaskStatus(task, today) === "overdue";
  return (
    <TableRow>
      {onToggle && (
        <TableCell className="px-3 py-3">
          <Checkbox
            aria-label={`Select ${task.title}`}
            checked={Boolean(checked)}
            onCheckedChange={onToggle}
            className="rounded-[4px] data-[checked]:border-sky-600 data-[checked]:bg-sky-600"
          />
        </TableCell>
      )}
      <TableCell
        className={cn(
          "px-3 py-3 text-xs",
          onViewDetails && "cursor-pointer",
          task.completed && "text-muted-foreground line-through",
        )}
        onClick={onViewDetails}
        onKeyDown={
          onViewDetails
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onViewDetails();
                }
              }
            : undefined
        }
        role={onViewDetails ? "button" : undefined}
        tabIndex={onViewDetails ? 0 : undefined}
      >
        {task.title}
      </TableCell>
      <TableCell className="px-3 py-3 text-xs">
        {eventName ? (
          <Chip label={eventName} color="bg-blue-600" />
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="px-3 py-3 text-xs">
        {sponsorName ? (
          <Chip label={sponsorName} color="bg-neutral-400" round />
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className={cn("px-3 py-3 text-xs", overdue ? "text-red-600" : "text-amber-600")}>
        {formatLongDate(task.dueDate)}
      </TableCell>
      {showActions && (
        <TableCell className="px-3 py-3">
          <Link
            href={`/calendar?date=${task.dueDate}`}
            aria-label={`View ${task.title} on the calendar`}
            className="rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MoreVertical className="h-4 w-4" aria-hidden />
          </Link>
        </TableCell>
      )}
    </TableRow>
  );
}

/** An event or sponsor cell: a grey letter badge and the name, or a dash. Also used by the archive page. */
export function NameCell({ name }: { name?: string }) {
  if (!name) return <span className="text-muted-foreground">-</span>;
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        aria-hidden
        className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-[10px] text-muted-foreground"
      >
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="truncate">{name}</span>
    </span>
  );
}

/** A small coloured letter badge followed by a name (used for the Event and Sponsor columns). */
function Chip({ label, color, round }: { label: string; color: string; round?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden
        className={cn(
          "grid h-4 w-4 shrink-0 place-items-center text-[9px] font-semibold text-white",
          round ? "rounded-full" : "rounded-[3px]",
          color,
        )}
      >
        {label.charAt(0).toUpperCase()}
      </span>
      <span className="truncate">{label}</span>
    </span>
  );
}
