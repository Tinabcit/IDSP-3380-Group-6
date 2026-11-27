"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, ChevronRight, MapPin, Plus } from "lucide-react";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { FilterBar } from "@/components/planner/filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/planner/contracts";
import { formatShortDate } from "@/lib/planner/dates";
import { summarizeEvent } from "@/lib/planner/event-detail";
import { splitEvents } from "@/lib/planner/tasks";
import { EMPTY_FILTERS, type ChamberEvent, type PlannerFilters } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

/**
 * The events page (/events). It applies the filters and splits events into
 * Upcoming and Past (the same groups as the sidebar). Each event shows when and
 * where it is, its sponsorship money and what is left to do; clicking it opens
 * the event's own page. (Here the sponsor filter means "has a contract with
 * that sponsor".)
 */
export function EventsPage() {
  const data = usePlannerData();
  const { today } = data;
  const [filters, setFilters] = useState<PlannerFilters>(EMPTY_FILTERS);

  const { upcoming, past } = useMemo(() => {
    const visible = data.events.filter((e) => {
      if (filters.signatureOnly && !e.isSignature) return false;
      if (filters.sponsorId) {
        return data.contracts.some((c) => c.eventId === e.id && c.sponsorId === filters.sponsorId);
      }
      return true;
    });
    return splitEvents(visible, today);
  }, [data.events, data.contracts, filters, today]);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight">Events</h1>
          <p className="text-sm text-muted-foreground">
            See which sponsors have signed for each event and how much has been paid. Click an
            event to see everything about it.
          </p>
        </div>
        <Button render={<Link href="/events/new" />} nativeButton={false}>
          <Plus />
          <span>
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add event</span>
          </span>
        </Button>
      </header>

      <FilterBar
        label="Filter events"
        filters={filters}
        sponsors={data.sponsors}
        onChange={setFilters}
      />

      <EventSection title="Upcoming" events={upcoming} empty="No upcoming events match." />
      <EventSection title="Past" events={past} empty="No past events match." />
    </div>
  );
}

/**
 * One list of events with a heading (used for "Upcoming" and "Past").
 * Each card links to the event's page.
 */
function EventSection({
  title,
  events,
  empty,
}: {
  title: string;
  events: ChamberEvent[];
  empty: string;
}) {
  const data = usePlannerData();
  return (
    <section aria-label={title} className="grid gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title} ({events.length})
      </h2>
      {events.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <ul className="grid gap-2">
          {events.map((event) => {
            const summary = summarizeEvent(event, data.contracts, data.tasks, data.sponsors, data.today);
            return (
              <li key={event.id}>
                <Link
                  href={`/events/${event.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    event.isSignature && "border-l-[3px] border-l-signature"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{event.name}</h3>
                      {event.isSignature && <Badge variant="signature">Signature</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" aria-hidden />
                        {formatShortDate(event.startDate)}
                        {event.endDate !== event.startDate && ` to ${formatShortDate(event.endDate)}`}
                      </span>
                      {event.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          {event.location}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                      <span>
                        {summary.sponsors.length} {summary.sponsors.length === 1 ? "sponsor" : "sponsors"}
                      </span>
                      <span className={cn(summary.overdue > 0 && "font-medium text-overdue")}>
                        {summary.openTasks.length === 0
                          ? "No tasks left"
                          : `${summary.openTasks.length} ${summary.openTasks.length === 1 ? "task" : "tasks"} to do`}
                        {summary.overdue > 0 && ` (${summary.overdue} overdue)`}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-semibold">{formatCurrency(summary.total)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(summary.received)} paid
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
