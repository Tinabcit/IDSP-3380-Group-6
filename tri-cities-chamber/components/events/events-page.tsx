"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Plus } from "lucide-react";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { FilterBar } from "@/components/planner/filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { amountPaid, formatCurrency } from "@/lib/planner/contracts";
import { formatShortDate } from "@/lib/planner/dates";
import { EMPTY_FILTERS, type ChamberEvent, type PlannerFilters } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

export function EventsPage() {
  const data = usePlannerData();
  const { today } = data;
  const [filters, setFilters] = useState<PlannerFilters>(EMPTY_FILTERS);
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

      <NewEventDialog open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}

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

function NewEventDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>{open && <NewEventForm onClose={onClose} />}</DialogContent>
    </Dialog>
  );
}

function NewEventForm({ onClose }: { onClose: () => void }) {
  const data = usePlannerData();
  const [name, setName] = useState("");
  const [date, setDate] = useState(data.today);
  const [endDate, setEndDate] = useState("");
  const [pillarId, setPillarId] = useState(data.pillars[0].id);
  const [isSignature, setIsSignature] = useState(false);
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Enter an event name.");
    if (!date) return setError("Choose a date.");
    if (endDate && endDate < date) return setError("The end date can't be before the start date.");
    data.addEvent({
      name: name.trim(),
      startDate: date,
      endDate: endDate || date,
      pillarId,
      isSignature,
      location: location.trim() || undefined,
    });
    onClose();
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>New event</DialogTitle>
        <DialogDescription>
          Events can repeat or be one-offs. Add each occurrence on its own.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <Label htmlFor="ev-name">Name</Label>
        <Input
          id="ev-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          autoComplete="off"
          autoFocus
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="ev-date">Date</Label>
          <Input id="ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ev-end">
            Last day <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="ev-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ev-pillar">Pillar</Label>
        <Select value={pillarId} onValueChange={setPillarId}>
          <SelectTrigger id="ev-pillar">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {data.pillars.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ev-loc">
          Location <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input id="ev-loc" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="ev-sig"
          checked={isSignature}
          onCheckedChange={(v) => setIsSignature(v === true)}
        />
        <Label htmlFor="ev-sig">Signature event</Label>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Add event</Button>
      </DialogFooter>
    </form>
  );
}
