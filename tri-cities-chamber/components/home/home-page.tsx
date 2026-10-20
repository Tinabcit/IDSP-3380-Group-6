"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Briefcase,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Home,
  ListFilter,
  MoreVertical,
  Plus,
  Search,
  Settings,
  User,
} from "lucide-react";

import { useToast } from "@/components/app-shell/toast-provider";
import { usePlannerData } from "@/components/app-shell/planner-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatLongDate, isISODateBefore, shiftISODate } from "@/lib/planner/dates";
import {
  eventBadge,
  paginate,
  searchTasks,
  sortByDueDate,
  splitEvents,
  type EventBadge,
} from "@/lib/planner/home";
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

/** The colours of the small sidebar labels. */
const BADGE_TONES: Record<EventBadge["tone"], string> = {
  danger: "bg-red-600 text-white",
  info: "bg-sky-600 text-white",
  dark: "bg-neutral-900 text-white",
};

/** The home page: a sidebar (events and partners) next to the "Tu Do Task Table". */
export function HomePage() {
  const data = usePlannerData();
  const toast = useToast();
  const { today, tasks, events, sponsors, lookups } = data;

  // What the user has chosen on screen.
  const [search, setSearch] = useState("");
  const [eventId, setEventId] = useState("all");
  const [sponsorId, setSponsorId] = useState("all");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]["value"]>("all");
  const [due, setDue] = useState<(typeof DUE_OPTIONS)[number]["value"]>("any");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [closed, setClosed] = useState<Set<string>>(new Set(["archived", "annual", "program"]));

  /** Opens or closes one of the sidebar sections. */
  function toggleSection(key: string) {
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  /** Runs a filter change and goes back to the first page, so the user never lands on an empty page. */
  function changeFilter(apply: () => void) {
    apply();
    setPage(0);
  }

  const groups = useMemo(() => splitEvents(events, today), [events, today]);
  const openTaskCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tasks) {
      if (t.completed || !t.eventId) continue;
      counts.set(t.eventId, (counts.get(t.eventId) ?? 0) + 1);
    }
    return counts;
  }, [tasks]);

  // Apply the dropdowns and search, then sort, then cut into pages.
  const visible = useMemo(() => {
    const horizon = shiftISODate(today, 7);
    const filtered = tasks.filter((t) => {
      if (eventId !== "all" && t.eventId !== eventId) return false;
      if (sponsorId !== "all" && t.sponsorId !== sponsorId) return false;
      const s = getTaskStatus(t, today);
      if (status === "open" && s === "completed") return false;
      if (status !== "all" && status !== "open" && s !== status) return false;
      if (due === "week" && (t.dueDate < today || t.dueDate > horizon)) return false;
      if (due === "past" && !isISODateBefore(t.dueDate, today)) return false;
      return true;
    });
    const searched = searchTasks(filtered, search, lookups.eventsById, lookups.sponsorsById);
    return sortByDueDate(searched, direction);
  }, [tasks, today, eventId, sponsorId, status, due, search, direction, lookups]);

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
      title: todo.length === 1 ? "1 task completed" : `${todo.length} tasks completed`,
    });
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* ---------- Sidebar ---------- */}
      <aside
        aria-label="Home sidebar"
        className="w-full shrink-0 rounded-lg border bg-neutral-50 p-4 lg:w-64"
      >
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-sky-600 text-white">
            <Briefcase className="h-4 w-4" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">TuDu</p>
            <p className="text-[11px] text-muted-foreground">Tri-Cities Chamber</p>
          </div>
        </div>

        <Button
          asChild
          className="mt-4 h-8 w-full justify-between bg-sky-600 px-3 text-xs hover:bg-sky-700"
        >
          <Link href="/contracts/new">
            Upload Contract
            <Plus aria-hidden />
          </Link>
        </Button>

        <div className="relative mt-3">
          <Search
            className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground"
            aria-hidden
          />
          <Input
            aria-label="Search tasks"
            placeholder="Search"
            value={search}
            onChange={(e) => changeFilter(() => setSearch(e.target.value))}
            className="h-7 bg-white pl-7 text-xs"
          />
        </div>

        <nav aria-label="Home menu" className="mt-4 flex flex-col gap-0.5 text-sm">
          <Link
            href="/"
            aria-current="page"
            className="flex items-center gap-2 rounded-md bg-white px-2 py-1.5 font-medium shadow-sm"
          >
            <Home className="h-4 w-4" aria-hidden /> Home
          </Link>
          <Link
            href="/calendar"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white"
          >
            <CalendarDays className="h-4 w-4" aria-hidden /> Calendar
          </Link>
          <span
            aria-disabled="true"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground"
          >
            <Settings className="h-4 w-4" aria-hidden /> Settings
          </span>
        </nav>

        <SidebarSection
          title="Repeat Events"
          open={!closed.has("repeat")}
          onToggle={() => toggleSection("repeat")}
          addHref="/events"
        >
          {groups.repeat.map((e) => (
            <SidebarItem
              key={e.id}
              label={e.name}
              active={eventId === e.id}
              badge={eventBadge(e, openTaskCount.get(e.id) ?? 0, today)}
              onClick={() => changeFilter(() => setEventId(eventId === e.id ? "all" : e.id))}
            />
          ))}
        </SidebarSection>

        <SidebarSection
          title="One-off Events"
          open={!closed.has("oneoff")}
          onToggle={() => toggleSection("oneoff")}
          addHref="/events"
        >
          {groups.oneOff.map((e) => (
            <SidebarItem
              key={e.id}
              label={e.name}
              active={eventId === e.id}
              badge={eventBadge(e, openTaskCount.get(e.id) ?? 0, today)}
              onClick={() => changeFilter(() => setEventId(eventId === e.id ? "all" : e.id))}
            />
          ))}
        </SidebarSection>

        <SidebarSection
          title="Archived Events"
          open={!closed.has("archived")}
          onToggle={() => toggleSection("archived")}
        >
          {groups.archived.map((e) => (
            <SidebarItem
              key={e.id}
              label={e.name}
              active={eventId === e.id}
              onClick={() => changeFilter(() => setEventId(eventId === e.id ? "all" : e.id))}
            />
          ))}
        </SidebarSection>

        {/* The data has no partner levels yet, so every partner is listed under Pillar. */}
        <SidebarSection
          title="Pillar Partners"
          open={!closed.has("pillar")}
          onToggle={() => toggleSection("pillar")}
          addHref="/partners"
        >
          {sponsors.map((s) => (
            <SidebarItem
              key={s.id}
              label={s.name}
              active={sponsorId === s.id}
              onClick={() => changeFilter(() => setSponsorId(sponsorId === s.id ? "all" : s.id))}
            />
          ))}
        </SidebarSection>

        <SidebarSection
          title="Annual Partners"
          open={!closed.has("annual")}
          onToggle={() => toggleSection("annual")}
          addHref="/partners"
        />
        <SidebarSection
          title="Program Partners"
          open={!closed.has("program")}
          onToggle={() => toggleSection("program")}
          addHref="/partners"
        />
      </aside>

      {/* ---------- Main: the task table ---------- */}
      <section aria-label="Tu Do Task Table" className="min-w-0 flex-1 rounded-lg border bg-white p-5">
        <h1 className="text-3xl font-bold tracking-tight">Tu Do Task Table</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Task details and scheduling for the current project.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Filter by event"
            icon={<ListFilter className="h-3.5 w-3.5" aria-hidden />}
            value={eventId}
            onChange={(v) => changeFilter(() => setEventId(v))}
            options={[{ value: "all", label: "All Events" }, ...events.map((e) => ({ value: e.id, label: e.name }))]}
          />
          <FilterSelect
            label="Filter by sponsor"
            icon={<User className="h-3.5 w-3.5" aria-hidden />}
            value={sponsorId}
            onChange={(v) => changeFilter(() => setSponsorId(v))}
            options={[{ value: "all", label: "All Sponsors" }, ...sponsors.map((s) => ({ value: s.id, label: s.name }))]}
          />
          <FilterSelect
            label="Filter by task status"
            icon={<Briefcase className="h-3.5 w-3.5" aria-hidden />}
            value={status}
            onChange={(v) => changeFilter(() => setStatus(v as typeof status))}
            options={[...STATUS_OPTIONS]}
          />
          <FilterSelect
            label="Filter by due date"
            icon={<CalendarDays className="h-3.5 w-3.5" aria-hidden />}
            value={due}
            onChange={(v) => changeFilter(() => setDue(v as typeof due))}
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
                    onClick={() => setDirection(direction === "asc" ? "desc" : "asc")}
                    className="inline-flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Due Date
                    <ArrowUpDown className="h-3 w-3" aria-hidden />
                    <span className="sr-only">
                      , sorted {direction === "asc" ? "oldest first" : "newest first"}
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
                  <td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">
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
                  eventName={t.eventId ? lookups.eventsById.get(t.eventId)?.name : undefined}
                  sponsorName={t.sponsorId ? lookups.sponsorsById.get(t.sponsorId)?.name : undefined}
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

/** One collapsible group in the sidebar: a title with an open/close arrow, an optional "+" link, and its items. */
function SidebarSection({
  title,
  open,
  onToggle,
  addHref,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  addHref?: string;
  children?: React.ReactNode;
}) {
  const Arrow = open ? ChevronDown : ChevronRight;
  return (
    <div className="mt-4 border-t pt-3">
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="flex flex-1 items-center gap-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {title}
          <Arrow className="ml-auto h-3.5 w-3.5" aria-hidden />
        </button>
        {addHref && (
          <Link href={addHref} aria-label={`Add to ${title}`} className="ml-2 rounded hover:bg-white">
            <Plus className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>
      {open && <ul className="mt-2 flex flex-col gap-1">{children}</ul>}
    </div>
  );
}

/** One clickable line in a sidebar section (an event or a partner), with an optional coloured label. */
function SidebarItem({
  label,
  active,
  badge,
  onClick,
}: {
  label: string;
  active: boolean;
  badge?: EventBadge;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active && "bg-white font-semibold shadow-sm"
        )}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {badge && (
          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px]", BADGE_TONES[badge.tone])}>
            {badge.text}
          </span>
        )}
      </button>
    </li>
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
      <SelectTrigger aria-label={label} className="h-7 w-auto gap-2 px-2 text-xs">
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
      <td className={cn("px-3 py-3 text-xs", task.completed && "text-muted-foreground line-through")}>
        {task.title}
      </td>
      <td className="px-3 py-3 text-xs">
        {eventName ? <Chip label={eventName} color="bg-blue-600" /> : <span className="text-muted-foreground">-</span>}
      </td>
      <td className="px-3 py-3 text-xs">
        {sponsorName ? <Chip label={sponsorName} color="bg-neutral-400" round /> : <span className="text-muted-foreground">-</span>}
      </td>
      <td className={cn("px-3 py-3 text-xs", overdue ? "text-red-600" : "text-amber-600")}>
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
function Chip({ label, color, round }: { label: string; color: string; round?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden
        className={cn(
          "grid h-4 w-4 shrink-0 place-items-center text-[9px] font-semibold text-white",
          round ? "rounded-full" : "rounded-[3px]",
          color
        )}
      >
        {label.charAt(0).toUpperCase()}
      </span>
      <span className="truncate">{label}</span>
    </span>
  );
}
