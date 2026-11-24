"use client";

import { useMemo, useState } from "react";
import { Briefcase, CalendarDays, ListFilter, User } from "lucide-react";

import {
  AppSidebar,
  useTasksFilters,
} from "@/components/app-shell/app-sidebar";
import { useToast } from "@/components/app-shell/toast-provider";
import { usePlannerData } from "@/components/app-shell/planner-provider";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/tasks/filter-select";
import { TaskTable } from "@/components/tasks/task-table";
import { isISODateBefore, shiftISODate } from "@/lib/planner/dates";
import { paginate, searchTasks, sortByDueDate } from "@/lib/planner/tasks";
import { getTaskStatus } from "@/lib/planner/selectors";
import TaskDetails, { type TaskInfo } from "@/components/TaskDetails";

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
 * The tasks page: the "Tu Do Task Table". The sidebar (app-sidebar.tsx) is shared
 * with every page; its search and event / partner picks filter this table.
 */
export function TasksPage() {
  const data = usePlannerData();
  const toast = useToast();
  const { today, tasks, events, sponsors, lookups } = data;

  // The search box and the event / partner picked in the sidebar (shared with every page).
  const { search, eventId, sponsorId, setEventId, setSponsorId, viewKey } =
    useTasksFilters();

  // What the user has chosen on screen.
  const [status, setStatus] =
    useState<(typeof STATUS_OPTIONS)[number]["value"]>("all");
  const [due, setDue] = useState<(typeof DUE_OPTIONS)[number]["value"]>("any");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Picking a different sponsor (here or in the sidebar), or any sidebar event / sponsor,
  // clears the other task filters.
  const resetKey = `${sponsorId}|${viewKey}`;
  const [seenResetKey, setSeenResetKey] = useState(resetKey);
  if (resetKey !== seenResetKey) {
    setSeenResetKey(resetKey);
    setStatus("all");
    setDue("any");
    setSelected(new Set());
  }

  const [selectedTask, setSelectedTask] = useState<TaskInfo | null>(null);

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
        className="min-w-0 flex-1 rounded-lg border bg-card p-5"
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

        <div className="mt-6">
          <TaskTable
            tasks={current.items}
            today={today}
            eventsById={lookups.eventsById}
            sponsorsById={lookups.sponsorsById}
            selection={{
              selected,
              allSelected: allOnPageSelected,
              onToggleRow: toggleRow,
              onToggleAll: toggleAllOnPage,
            }}
            onViewDetails={(t) =>
              setSelectedTask({
                id: t.id,
                title: t.title,
                description: "",
                priority: "Medium",
                dueDate: t.dueDate,
                assignedTo: "",
                event: t.eventId
                  ? lookups.eventsById.get(t.eventId)?.name || ""
                  : "",
              })
            }
            sort={{
              direction,
              onToggle: () =>
                setDirection(direction === "asc" ? "desc" : "asc"),
            }}
          />
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
      {selectedTask && (
        <TaskDetails
          key={selectedTask.id}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={(updatedTask) => {
            setSelectedTask(updatedTask);
          }}
        />
      )}
    </div>
  );
}
