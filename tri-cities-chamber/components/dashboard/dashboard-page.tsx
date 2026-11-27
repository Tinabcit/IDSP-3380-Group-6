"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, CalendarDays, FileText } from "lucide-react";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fromISODate, shiftISODate } from "@/lib/planner/dates";
import { sortByDueDate, splitEvents } from "@/lib/planner/home";
import type { ISODate, Task } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

/** How many days the "Due dates at a glance" strip covers, starting today. */
const GLANCE_DAYS = 10;

/** Formats a date like "October 5th, 2024". */
function formatTableDate(value: ISODate) {
  return format(fromISODate(value), "MMMM do, yyyy");
}

/**
 * The dashboard: due dates for the next 10 days (counts, a day strip and a list),
 * the uploaded contract files, and tabs for all, completed and archived items.
 */
export function DashboardPage() {
  const { today, tasks, events, contracts, lookups } = usePlannerData();
  const [eventId, setEventId] = useState("all");
  const [sponsorId, setSponsorId] = useState("all");
  const [pickedDay, setPickedDay] = useState<ISODate | null>(null);

  const days = useMemo(
    () => Array.from({ length: GLANCE_DAYS }, (_, i) => shiftISODate(today, i)),
    [today],
  );
  const lastDay = days[days.length - 1];

  // Open tasks due in the 10-day window, earliest first.
  const windowTasks = useMemo(
    () =>
      sortByDueDate(
        tasks.filter(
          (t) => !t.completed && t.dueDate >= today && t.dueDate <= lastDay,
        ),
        "asc",
      ),
    [tasks, today, lastDay],
  );

  const countByDay = useMemo(() => {
    const counts = new Map<ISODate, number>();
    for (const t of windowTasks)
      counts.set(t.dueDate, (counts.get(t.dueDate) ?? 0) + 1);
    return counts;
  }, [windowTasks]);

  const stats = useMemo(
    () => ({
      dated: windowTasks.length,
      events: new Set(windowTasks.map((t) => t.eventId).filter(Boolean)).size,
      sponsorTasks: windowTasks.filter((t) => t.sponsorId).length,
    }),
    [windowTasks],
  );

  // The list under the strip: the window tasks, narrowed by the picked day and the two dropdowns.
  const upcoming = windowTasks.filter(
    (t) =>
      (!pickedDay || t.dueDate === pickedDay) &&
      (eventId === "all" || t.eventId === eventId) &&
      (sponsorId === "all" || t.sponsorId === sponsorId),
  );

  const allTasks = useMemo(() => sortByDueDate(tasks, "asc"), [tasks]);
  const completedTasks = useMemo(
    () => allTasks.filter((t) => t.completed),
    [allTasks],
  );
  const archivedEvents = useMemo(
    () => splitEvents(events, today).archived,
    [events, today],
  );
  const documents = useMemo(
    () => contracts.filter((c) => c.fileName),
    [contracts],
  );

  return (
    <div className='grid gap-6'>
      <header className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Tu Do Dashboard</h1>
          <p className='text-sm text-muted-foreground'>
            A clear view of due dates across your events and projects.
          </p>
        </div>
        <Button
          asChild
          variant='outline'
          size='sm'
        >
          <Link href='/'>
            View task table
            <ArrowUpRight aria-hidden />
          </Link>
        </Button>
      </header>

      <Tabs defaultValue='overview'>
        <TabsList className='h-auto w-full justify-start gap-4 overflow-x-auto rounded-none border-b bg-transparent p-0'>
          {[
            ["overview", "Due date overview"],
            ["all", "All tasks"],
            ["completed", "Completed Tasks"],
            ["archived", "Archived Events"],
          ].map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className='-mb-px rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none'
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent
          value='overview'
          className='mt-5 grid gap-5'
        >
          <p className='flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-sky-100 bg-sky-50 px-4 py-2.5 text-sm'>
            <CalendarDays
              className='h-4 w-4 text-sky-700'
              aria-hidden
            />
            <span className='font-semibold text-sky-800'>
              Reference period: {format(fromISODate(today), "MMMM d")}–
              {format(fromISODate(lastDay), "d, yyyy")}
            </span>
            <span className='text-muted-foreground'>
              Open tasks due in the next {GLANCE_DAYS} days.
            </span>
          </p>

          <div className='grid gap-4 sm:grid-cols-3'>
            <StatCard
              label='Dated Tasks'
              value={stats.dated}
            />
            <StatCard
              label='Events and Projects'
              value={stats.events}
            />
            <StatCard
              label='Events and Sponsor Tasks'
              value={stats.sponsorTasks}
            />
          </div>

          <Card>
            <CardHeader className='flex-row items-center justify-between space-y-0 pb-4'>
              <CardTitle className='text-base'>Due dates at a glance</CardTitle>
              <span className='text-xs text-muted-foreground'>
                {format(fromISODate(today), "MMMM yyyy")} · Tasks per day
              </span>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-5 gap-2 lg:grid-cols-10'>
                {days.map((day) => {
                  const count = countByDay.get(day) ?? 0;
                  const picked = pickedDay === day;
                  return (
                    <button
                      key={day}
                      type='button'
                      aria-pressed={picked}
                      onClick={() => setPickedDay(picked ? null : day)}
                      className={cn(
                        "grid gap-1 rounded-md py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        count ?
                          "bg-sky-50 hover:bg-sky-100"
                        : "bg-muted hover:bg-muted/70",
                        picked && "ring-2 ring-primary",
                      )}
                    >
                      <span className='text-xs text-muted-foreground'>
                        {format(fromISODate(day), "EEE")}
                      </span>
                      <span className='text-xl font-semibold'>
                        {format(fromISODate(day), "d")}
                      </span>
                      <span
                        className={cn(
                          "text-[11px]",
                          count ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        •{" "}
                        {count ?
                          `${count} ${count === 1 ? "task" : "tasks"}`
                        : "No tasks"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex-row items-start justify-between space-y-0'>
              <div className='grid gap-1'>
                <CardTitle className='text-base'>Uploaded documents</CardTitle>
                <CardDescription>
                  Contract files related to your events and sponsors.
                </CardDescription>
              </div>
              <Badge variant='outline'>
                {documents.length} {documents.length === 1 ? "file" : "files"}
              </Badge>
            </CardHeader>
            <CardContent className='grid gap-2'>
              {documents.length === 0 && (
                <p className='rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground'>
                  No files yet.{" "}
                  <Link
                    href='/contracts/new'
                    className='font-medium text-primary hover:underline'
                  >
                    Upload a contract
                  </Link>
                </p>
              )}
              {documents.map((c) => (
                <div
                  key={c.id}
                  className='flex items-center gap-3 rounded-md border px-3 py-2.5'
                >
                  <span className='grid h-9 w-9 shrink-0 place-items-center rounded-md bg-sky-50 text-sky-700'>
                    <FileText
                      className='h-4 w-4'
                      aria-hidden
                    />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{c.fileName}</p>
                    <p className='truncate text-xs text-muted-foreground'>
                      {lookups.sponsorsById.get(c.sponsorId)?.name ??
                        "No sponsor"}{" "}
                      • Updated {format(new Date(c.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant='ghost'
                    size='sm'
                    className='h-7 text-primary'
                  >
                    <Link href={`/contracts/${c.id}`}>View</Link>
                  </Button>
                  <Badge
                    variant='secondary'
                    className='hidden capitalize sm:inline-flex'
                  >
                    {c.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex-row flex-wrap items-start justify-between gap-3 space-y-0'>
              <div className='grid gap-1'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  Upcoming due dates{" "}
                  <Badge variant='secondary'>{upcoming.length}</Badge>
                </CardTitle>
                <CardDescription>
                  {pickedDay ?
                    <>
                      Showing {format(fromISODate(pickedDay), "MMMM d")} only ·{" "}
                      <button
                        type='button'
                        onClick={() => setPickedDay(null)}
                        className='font-medium text-primary hover:underline'
                      >
                        Show all days
                      </button>
                    </>
                  : "Within the reference period · Earliest due first"}
                </CardDescription>
              </div>
              <div className='flex gap-2'>
                <Select
                  value={eventId}
                  onValueChange={setEventId}
                >
                  <SelectTrigger
                    aria-label='Filter by event'
                    className='h-8 w-36 text-xs'
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All events</SelectItem>
                    {events.map((e) => (
                      <SelectItem
                        key={e.id}
                        value={e.id}
                      >
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={sponsorId}
                  onValueChange={setSponsorId}
                >
                  <SelectTrigger
                    aria-label='Filter by sponsor'
                    className='h-8 w-36 text-xs'
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All sponsors</SelectItem>
                    {[...lookups.sponsorsById.values()].map((s) => (
                      <SelectItem
                        key={s.id}
                        value={s.id}
                      >
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <TaskTable
                tasks={upcoming}
                empty='No tasks due in this period.'
              />
              <p className='border-t px-6 py-3 text-xs text-muted-foreground'>
                {upcoming.length} of {windowTasks.length} tasks shown
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value='all'
          className='mt-5'
        >
          <Card>
            <CardContent className='p-0'>
              <TaskTable
                tasks={allTasks}
                empty='No tasks yet.'
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value='completed'
          className='mt-5'
        >
          <Card>
            <CardContent className='p-0'>
              <TaskTable
                tasks={completedTasks}
                empty='No completed tasks yet.'
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value='archived'
          className='mt-5'
        >
          <Card>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedEvents.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className='py-10 text-center text-muted-foreground'
                      >
                        No archived events.
                      </TableCell>
                    </TableRow>
                  )}
                  {archivedEvents.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className='font-medium'>{e.name}</TableCell>
                      <TableCell>
                        {formatTableDate(e.startDate)}
                        {e.endDate !== e.startDate &&
                          ` – ${formatTableDate(e.endDate)}`}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {e.location ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** One of the three number cards at the top. */
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className='grid gap-2 p-5'>
        <span className='text-sm text-muted-foreground'>{label}</span>
        <span className='text-2xl font-semibold'>{value}</span>
      </CardContent>
    </Card>
  );
}

/** A table of tasks: due date, task, event and who it is assigned to. */
function TaskTable({ tasks, empty }: { tasks: Task[]; empty: string }) {
  const { lookups } = usePlannerData();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='pl-6'>Due date</TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>Assigned to</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={4}
              className='py-10 text-center text-muted-foreground'
            >
              {empty}
            </TableCell>
          </TableRow>
        )}
        {tasks.map((t) => {
          const event =
            t.eventId ? lookups.eventsById.get(t.eventId) : undefined;
          const person = lookups.staffById.get(t.assigneeId);
          return (
            <TableRow key={t.id}>
              <TableCell className='whitespace-nowrap pl-6'>
                {formatTableDate(t.dueDate)}
              </TableCell>
              <TableCell
                className={cn(
                  t.completed && "text-muted-foreground line-through",
                )}
              >
                {t.title}
              </TableCell>
              <TableCell>
                {event ?
                  <span className='flex items-center gap-2'>
                    <span className='grid h-5 w-5 shrink-0 place-items-center rounded bg-primary text-[10px] font-semibold text-primary-foreground'>
                      {event.name.charAt(0)}
                    </span>
                    <span className='truncate'>{event.name}</span>
                  </span>
                : <span className='text-muted-foreground'>-</span>}
              </TableCell>
              <TableCell>
                {person ?
                  <span className='flex items-center gap-2'>
                    <span className='grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-[10px] text-muted-foreground'>
                      {person.initials.charAt(0)}
                    </span>
                    {person.name}
                  </span>
                : <span className='text-muted-foreground'>-</span>}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
