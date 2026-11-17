"use client";

import { useState } from "react";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { FilterSelect } from "@/components/tasks/filter-select";
import { NameCell } from "@/components/tasks/task-table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { countEvents, countSponsors, getCompletedTasks } from "@/lib/planner/archive";
import { formatOrdinalDate } from "@/lib/planner/dates";
import { CardInfo } from "./cardInfo";
import { DashboardHeader } from "./dashboard-header";

export function ArchivePage() {
  const { tasks, events, sponsors, lookups, toggleTask } = usePlannerData();
  const [query, setQuery] = useState("");
  const [sponsorId, setSponsorId] = useState("all");
  const [eventId, setEventId] = useState("all");

  const { eventsById, sponsorsById } = lookups;
  const allCompleted = getCompletedTasks(tasks, eventsById, sponsorsById);
  const completed = getCompletedTasks(
    tasks,
    eventsById,
    sponsorsById,
    query,
    eventId,
    sponsorId,
  );

  const eventOptions = [
    { value: "all", label: "All events" },
    ...events.map((e) => ({ value: e.id, label: e.name })),
  ];
  const sponsorOptions = [
    { value: "all", label: "All sponsors" },
    ...sponsors.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader
        title="Completed tasks"
        subtitle="Every task marked as done in your workspace."
      />

      <div className="flex w-fit max-w-full overflow-x-auto rounded-lg border bg-card text-card-foreground">
        <CardInfo
          headingText="Completed tasks"
          numberInfo={allCompleted.length}
        />
        <CardInfo
          headingText="Events"
          numberInfo={countEvents(allCompleted)}
        />
        <CardInfo
          headingText="Sponsors"
          numberInfo={countSponsors(allCompleted)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search completed tasks"
          aria-label="Search completed tasks"
          className="h-8 sm:w-64"
        />
        <FilterSelect
          label="Filter by event"
          value={eventId}
          onChange={setEventId}
          options={eventOptions}
        />
        <FilterSelect
          label="Filter by sponsor"
          value={sponsorId}
          onChange={setSponsorId}
          options={sponsorOptions}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            Completed to-do list{" "}
            <Badge variant="secondary">{completed.length}</Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Latest due date first &middot; Untick a task to move it back to the
            active list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[720px]">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-10">
                  <span className="sr-only">Done</span>
                </TableHead>
                <TableHead>Tu Do task name</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Due date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completed.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No completed tasks match these filters.
                  </TableCell>
                </TableRow>
              )}
              {completed.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Checkbox
                      checked
                      onCheckedChange={() => toggleTask(t.id)}
                      aria-label={`Mark "${t.title}" as not done`}
                    />
                  </TableCell>
                  <TableCell>{t.title}</TableCell>
                  <TableCell>
                    <NameCell
                      name={
                        t.eventId ? eventsById.get(t.eventId)?.name : undefined
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <NameCell
                      name={
                        t.sponsorId
                          ? sponsorsById.get(t.sponsorId)?.name
                          : undefined
                      }
                    />
                  </TableCell>
                  <TableCell>{formatOrdinalDate(t.dueDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Showing {completed.length} of {allCompleted.length} completed tasks
        </CardFooter>
      </Card>
    </div>
  );
}
