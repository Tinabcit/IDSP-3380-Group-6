"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Briefcase,
  CalendarDays,
  ListFilter,
  MoreVertical,
  User,
} from "lucide-react";

import { AppSidebar, useHomeFilters } from "@/components/app-shell/app-sidebar";
import { useToast } from "@/components/app-shell/toast-provider";
import { usePlannerData } from "@/components/app-shell/planner-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatLongDate,
  isISODateBefore,
  shiftISODate,
} from "@/lib/planner/dates";
import { paginate, searchTasks, sortByDueDate } from "@/lib/planner/home";
import { getTaskStatus } from "@/lib/planner/selectors";
import type { ISODate, Task } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

/** How many rows the table shows per page. */
const PAGE_SIZE = 9;

/** The "Tasks" filter choices. */
const STATUS_OPTIONS = [
  { value: "all", label: "Tasks" },
  { value: "open", label: "Open" },
  { value: "overdue", label: "Overdue" },
  { value: "completed", label: "Completed" },
] as const;

/** The "Due date" filter choices. */
const DUE_OPTIONS = [
  { value: "any", label: "Due date" },
  { value: "week", label: "Next 7 days" },
  { value: "past", label: "Already due" },
] as const;

/**
 * The home page: the "Tu Do Task Table". The sidebar (app-sidebar.tsx) is shared
 * with every page; its search and event / partner picks filter this table.
 */
export function HomePage() {
  const data = usePlannerData();
  const toast = useToast();
  const { today, tasks, events, sponsors, lookups } = data;

  // The search box and the event / partner picked in the sidebar (shared with every page).
  const { search, eventId, sponsorId, setEventId, setSponsorId } =
    useHomeFilters();

  // What the user has chosen on screen.
  const [status, setStatus] =
    useState<(typeof STATUS_OPTIONS)[number]["value"]>("all");
  const [due, setDue] = useState<(typeof DUE_OPTIONS)[number]["value"]>("any");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // The page number remembers which filters it was picked for. When any filter
  // changes (here or in the sidebar), it goes back to the first page, so the
  // user never lands on an empty page.
  const filterKey = [search, eventId, sponsorId, status, due].join("|");
  const [pageState, setPageState] = useState({ key: filterKey, page: 0 });
  const page = pageState.key === filterKey ? pageState.page : 0;
  const setPage = (next: number) =>
    setPageState({ key: filterKey, page: next });

  // Apply the dropdowns and search, then sort, then cut into pages.
  const visible = useMemo(() => {
    const horizon = shiftISODate(today, 7);
    const filtered = tasks.filter((t) => {
      if (eventId !== "all" && t.eventId !== eventId) return false;
      if (sponsorId !== "all" && t.sponsorId !== sponsorId) return false;
      const s = getTaskStatus(t, today);
      if (status === "open" && s === "completed") return false;
      if (status !== "all" && status !== "open" && s !== status) return false;
      if (due === "week" && (t.dueDate < today || t.dueDate > horizon))
        return false;
      if (due === "past" && !isISODateBefore(t.dueDate, today)) return false;
      return true;
    });
    const searched = searchTasks(
      filtered,
      search,
      lookups.eventsById,
      lookups.sponsorsById,
    );
    return sortByDueDate(searched, direction);
  }, [
    tasks,
    today,
    eventId,
    sponsorId,
    status,
    due,
    search,
    direction,
    lookups,
  ]);

  const current = paginate(visible, page, PAGE_SIZE);
  const allOnPageSelected =
    current.items.length > 0 && current.items.every((t) => selected.has(t.id));
  const selectedCount = visible.filter((t) => selected.has(t.id)).length;

  /** Ticks or unticks one row. */
  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** Ticks or unticks every row on the current page. */
  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const t of current.items) {
        if (allOnPageSelected) next.delete(t.id);
        else next.add(t.id);
      }
      return next;
    });
  }

  /** Marks every selected task as done (tasks already done are left alone). */
  function markSelectedComplete() {
    const todo = visible.filter((t) => selected.has(t.id) && !t.completed);
    todo.forEach((t) => data.toggleTask(t.id));
    setSelected(new Set());
    toast({
      title:
        todo.length === 1
          ? "1 task completed"
          : `${todo.length} tasks completed`,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* On phones the shared sidebar is hidden, so its search and filters show above the table here. */}

      {/* ---------- Main: the task table ---------- */}
      <section
        aria-label="Tu Do Task Table"
        className="min-w-0 flex-1 rounded-lg border bg-white p-5"
      >
        <h1 className="text-3xl font-bold tracking-tight">Tu Do Task Table</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Task details and scheduling for the current project.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Filter by event"
            icon={<ListFilter className="h-3.5 w-3.5" aria-hidden />}
            value={eventId}
            onChange={(v) => setEventId(v)}
            options={[
              { value: "all", label: "All Events" },
              ...events.map((e) => ({ value: e.id, label: e.name })),
            ]}
          />
          <FilterSelect
            label="Filter by sponsor"
            icon={<User className="h-3.5 w-3.5" aria-hidden />}
            value={sponsorId}
            onChange={(v) => setSponsorId(v)}
            options={[
              { value: "all", label: "All Sponsors" },
              ...sponsors.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
          <FilterSelect
            label="Filter by task status"
            icon={<Briefcase className="h-3.5 w-3.5" aria-hidden />}
            value={status}
            onChange={(v) => setStatus(v as typeof status)}
            options={[...STATUS_OPTIONS]}
          />
          <FilterSelect
            label="Filter by due date"
            icon={<CalendarDays className="h-3.5 w-3.5" aria-hidden />}
            value={due}
            onChange={(v) => setDue(v as typeof due)}
            options={[...DUE_OPTIONS]}
          />
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-neutral-100">
              <tr>
                <th className="w-10 px-3 py-2">
                  <Checkbox
                    aria-label="Select all rows on this page"
                    checked={allOnPageSelected}
                    onCheckedChange={toggleAllOnPage}
                    className="rounded-[4px] data-[state=checked]:border-sky-600 data-[state=checked]:bg-sky-600"
                  />
                </th>
                <th className="px-3 py-2 font-semibold">Tu Do Task Name</th>
                <th className="px-3 py-2 font-semibold">Event</th>
                <th className="px-3 py-2 font-semibold">Sponsor</th>
                <th className="px-3 py-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() =>
                      setDirection(direction === "asc" ? "desc" : "asc")
                    }
                    className="inline-flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Due Date
                    <ArrowUpDown className="h-3 w-3" aria-hidden />
                    <span className="sr-only">
                      , sorted{" "}
                      {direction === "asc" ? "oldest first" : "newest first"}
                    </span>
                  </button>
                </th>
                <th className="w-8 px-3 py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {current.items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-muted-foreground"
                  >
                    No tasks match these filters.
                  </td>
                </tr>
              )}
              {current.items.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  today={today}
                  checked={selected.has(t.id)}
                  onToggle={() => toggleRow(t.id)}
                  eventName={
                    t.eventId
                      ? lookups.eventsById.get(t.eventId)?.name
                      : undefined
                  }
                  sponsorName={
                    t.sponsorId
                      ? lookups.sponsorsById.get(t.sponsorId)?.name
                      : undefined
                  }
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <p aria-live="polite">
            {selectedCount} of {visible.length} row(s) selected.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={current.page === 0}
              onClick={() => setPage(current.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={current.page >= current.pageCount - 1}
              onClick={() => setPage(current.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        <Button
          className="mt-5 h-8 bg-sky-600 px-3 text-xs hover:bg-sky-700"
          disabled={selectedCount === 0}
          onClick={markSelectedComplete}
        >
          Mark as Complete
        </Button>
      </section>
    </div>
  );
}

/** A small dropdown used in the filter row above the table. */
function FilterSelect({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className="h-7 w-auto gap-2 px-2 text-xs"
      >
        {icon}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** One row of the table: tick box, task name, event, sponsor, due date (orange when overdue) and a link to the calendar. */
function TaskRow({
  task,
  today,
  checked,
  onToggle,
  eventName,
  sponsorName,
}: {
  task: Task;
  today: ISODate;
  checked: boolean;
  onToggle: () => void;
  eventName?: string;
  sponsorName?: string;
}) {
  const overdue = getTaskStatus(task, today) === "overdue";
  return (
    <tr className="border-t">
      <td className="px-3 py-3">
        <Checkbox
          aria-label={`Select ${task.title}`}
          checked={checked}
          onCheckedChange={onToggle}
          className="rounded-[4px] data-[state=checked]:border-sky-600 data-[state=checked]:bg-sky-600"
        />
      </td>
      <td
        className={cn(
          "px-3 py-3 text-xs",
          task.completed && "text-muted-foreground line-through",
        )}
      >
        {task.title}
      </td>
      <td className="px-3 py-3 text-xs">
        {eventName ? (
          <Chip label={eventName} color="bg-blue-600" />
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="px-3 py-3 text-xs">
        {sponsorName ? (
          <Chip label={sponsorName} color="bg-neutral-400" round />
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td
        className={cn(
          "px-3 py-3 text-xs",
          overdue ? "text-red-600" : "text-amber-600",
        )}
      >
        {formatLongDate(task.dueDate)}
      </td>
      <td className="px-3 py-3">
        <Link
          href={`/calendar?date=${task.dueDate}`}
          aria-label={`View ${task.title} on the calendar`}
          className="rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MoreVertical className="h-4 w-4" aria-hidden />
        </Link>
      </td>
    </tr>
  );
}

/** A small coloured letter badge followed by a name (used for the Event and Sponsor columns). */
function Chip({
  label,
  color,
  round,
}: {
  label: string;
  color: string;
  round?: boolean;
}) {
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
