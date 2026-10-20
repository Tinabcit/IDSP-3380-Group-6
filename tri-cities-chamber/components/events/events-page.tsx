"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Plus } from "lucide-react";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { useToast } from "@/components/app-shell/toast-provider";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { FilterBar } from "@/components/planner/filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { amountPaid, formatCurrency } from "@/lib/planner/contracts";
import { formatShortDate } from "@/lib/planner/dates";
import { EMPTY_FILTERS, type ChamberEvent, type PlannerFilters } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

/**
 * The events page (/events). It applies the filters, splits events into
 * Upcoming and Past, and shows each one with its contracts and money.
 * Has an "Add event" button. (Here the sponsor filter means "has a contract
 * with that sponsor".)
 */
export function EventsPage() {
  const data = usePlannerData();
  const { today } = data;
  const [filters, setFilters] = useState<PlannerFilters>(EMPTY_FILTERS);
  const toast = useToast();
  const [adding, setAdding] = useState(false);

  const { upcoming, past } = useMemo(() => {
    const visible = data.events.filter((e) => {
      if (filters.signatureOnly && !e.isSignature) return false;
      if (filters.pillarId && e.pillarId !== filters.pillarId) return false;
      if (filters.sponsorId) {
        return data.contracts.some((c) => c.eventId === e.id && c.sponsorId === filters.sponsorId);
      }
      return true;
    });
    const byStart = (a: ChamberEvent, b: ChamberEvent) => a.startDate.localeCompare(b.startDate);
    return {
      upcoming: visible.filter((e) => e.endDate >= today).sort(byStart),
      past: visible.filter((e) => e.endDate < today).sort((a, b) => byStart(b, a)),
    };
  }, [data.events, data.contracts, filters, today]);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight">Events</h1>
          <p className="text-sm text-muted-foreground">
            Sponsorship for each event is added up from its contracts.
          </p>
        </div>
        <Button onClick={() => setAdding(true)}>
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
        pillars={data.pillars}
        sponsors={data.sponsors}
        onChange={setFilters}
      />

      <EventSection title="Upcoming" events={upcoming} empty="No upcoming events match." />
      <EventSection title="Past" events={past} empty="No past events match." />

      <EventFormDialog
        state={adding ? { mode: "create", defaultDate: today } : null}
        onClose={() => setAdding(false)}
        onSubmit={(input) => {
          data.addEvent(input);
          toast({ title: "Event added", description: input.name });
        }}
      />
    </div>
  );
}

/**
 * One list of events with a heading (used for "Upcoming" and "Past").
 * Each event shows its pillar, location and contracts.
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
  const { lookups } = data;
  return (
    <section aria-label={title} className="grid gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {events.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <ul className="grid gap-2">
          {events.map((event) => {
            const pillar = lookups.pillarsById.get(event.pillarId);
            const contracts = data.contracts.filter((c) => c.eventId === event.id);
            const total = contracts.reduce((n, c) => n + c.amount, 0);
            const received = contracts.reduce((n, c) => n + amountPaid(c), 0);
            return (
              <li
                key={event.id}
                className={cn(
                  "rounded-lg border bg-card p-4",
                  event.isSignature && "border-l-[3px] border-l-signature"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
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
                      {pillar && <span>{pillar.name}</span>}
                      {event.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(total)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(received)} received
                    </div>
                  </div>
                </div>

                {contracts.length > 0 ? (
                  <ul aria-label={`Contracts for ${event.name}`} className="mt-3 grid gap-1 border-t pt-3">
                    {contracts.map((c) => (
                      <li key={c.id} className="flex justify-between gap-3 text-sm">
                        <Link
                          href={`/contracts/${c.id}`}
                          className="min-w-0 truncate underline-offset-2 hover:underline"
                        >
                          {lookups.sponsorsById.get(c.sponsorId)?.name}: {c.title}
                        </Link>
                        <span className="shrink-0 text-muted-foreground">
                          {formatCurrency(c.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">
                    No contracts yet.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
