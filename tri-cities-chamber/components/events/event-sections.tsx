"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { addMonths, format, isSameMonth } from "date-fns";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  EVENT_LABELS,
  EVENT_PRIORITIES,
  EVENT_REMINDERS,
  TICKET_TYPES,
  cleanSponsors,
  compTicketStats,
  initialsOf,
  toggleItem,
  type EventExtras,
} from "@/lib/planner/events";
import { formatLongDate, fromISODate, getMonthGrid, getWeekdayLabels, shiftISODate, toISODate } from "@/lib/planner/dates";
import type { EventCompTicket, EventPriority, EventReminder, ISODate } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

/** A titled card that holds one group of event fields. */
export function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid gap-3 rounded-lg border bg-card p-4", className)}>
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

/** The quick-pick buttons under a calendar: how many days from today each one jumps to. */
const QUICK_PICKS = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "In 3 days", days: 3 },
  { label: "In a week", days: 7 },
  { label: "In 2 weeks", days: 14 },
];

/**
 * A small month calendar with quick-pick buttons. Click a day to choose it, click
 * it again to clear it. Shows the chosen day in words so it is clear what is picked.
 */
export function MiniCalendar({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: ISODate) => void;
  error?: string;
}) {
  const { today } = usePlannerData();
  const [month, setMonth] = useState(() => fromISODate(value || today));
  const weekdays = getWeekdayLabels();

  /** Picks a day, or clears it when it is already the chosen one. */
  function pick(day: ISODate) {
    onChange(day === value ? "" : day);
  }

  return (
    <Section title={label}>
      <div className="grid gap-3 rounded-md border p-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`${label}: previous month`}
            onClick={() => setMonth((m) => addMonths(m, -1))}
          >
            <ChevronLeft />
          </Button>
          <p className="text-sm font-medium" aria-live="polite">
            {format(month, "MMMM yyyy")}
          </p>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`${label}: next month`}
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {weekdays.map((d) => (
            <span key={d.long} aria-hidden>
              {d.short}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {getMonthGrid(month).map((day) => {
            const iso = toISODate(day);
            const selected = iso === value;
            return (
              <button
                key={iso}
                type="button"
                aria-pressed={selected}
                aria-label={formatLongDate(iso)}
                onClick={() => pick(iso)}
                className={cn(
                  "h-9 rounded-md text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSameMonth(day, month) ? "bg-muted/50" : "text-muted-foreground/60",
                  selected && "bg-primary font-semibold text-primary-foreground hover:bg-primary"
                )}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_PICKS.map((q) => (
            <Button
              key={q.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const iso = shiftISODate(today, q.days);
                onChange(iso);
                setMonth(fromISODate(iso));
              }}
            >
              {q.label}
            </Button>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {value ? formatLongDate(value) : "No date chosen."}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </Section>
  );
}

/** A row of big P1 to P6 buttons. Click the chosen one again to clear the priority. */
export function PriorityPicker({
  value,
  onChange,
}: {
  value: EventPriority | null;
  onChange: (value: EventPriority | null) => void;
}) {
  return (
    <Section title="Priority">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {EVENT_PRIORITIES.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={value === p}
            onClick={() => onChange(value === p ? null : p)}
            className={cn(
              "h-16 rounded-lg border text-lg font-bold transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === p && "border-primary bg-primary text-primary-foreground hover:bg-primary"
            )}
          >
            P{p}
          </button>
        ))}
      </div>
    </Section>
  );
}

/** Pill buttons that switch on and off, used for labels, reminders and ticket types. */
export function ToggleChips({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <Section title={title}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                on ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </Section>
  );
}

/** Names shown as chips with their initials. Type a name and press Add (or Enter) to add one. */
export function NameChips({
  title,
  names,
  onChange,
  placeholder,
  suggestions,
}: {
  title: string;
  names: string[];
  onChange: (names: string[]) => void;
  placeholder: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const listId = `chips-${title.toLowerCase()}`;

  /** Adds the typed name (blanks and repeats are dropped) and clears the box. */
  function add() {
    onChange(cleanSponsors([...names, draft]));
    setDraft("");
  }

  return (
    <Section title={title}>
      {names.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {names.map((name) => (
            <li key={name} className="flex items-center gap-2 rounded-full bg-muted py-1 pl-2 pr-1 text-sm">
              <span aria-hidden className="text-xs font-medium text-muted-foreground">
                {initialsOf(name)}
              </span>
              {name}
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={() => onChange(names.filter((n) => n !== name))}
                className="rounded-full p-1 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          aria-label={`Add to ${title}`}
          value={draft}
          placeholder={placeholder}
          list={suggestions ? listId : undefined}
          autoComplete="off"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter adds the name instead of submitting the whole form.
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add} disabled={!draft.trim()}>
          <Plus />
          Add
        </Button>
      </div>
      {suggestions && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </Section>
  );
}

/**
 * The comp tickets for one event: four count cards, a table, and a small form to
 * issue more. Issuing adds a row to the list the parent holds; nothing is sent anywhere.
 */
export function CompTicketsSection({
  tickets,
  onChange,
}: {
  tickets: EventCompTicket[];
  onChange: (tickets: EventCompTicket[]) => void;
}) {
  const [recipient, setRecipient] = useState("");
  const [ticketType, setTicketType] = useState(TICKET_TYPES[0]);
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState("");
  const stats = compTicketStats(tickets);

  /** Checks the little form and adds one issued row to the table. */
  function issue() {
    const count = Number(quantity);
    if (!recipient.trim()) return setError("Enter who the tickets are for.");
    if (!Number.isInteger(count) || count < 1) return setError("Enter 1 or more tickets.");
    onChange([
      ...tickets,
      { id: crypto.randomUUID(), recipient: recipient.trim(), ticketType, quantity: count, status: "Issued" },
    ]);
    setRecipient("");
    setQuantity("1");
    setError("");
  }

  const cards = [
    { label: "Recipients", value: stats.recipients },
    { label: "Tickets issued", value: stats.issued },
    { label: TICKET_TYPES[0], value: stats.byType[TICKET_TYPES[0]] ?? 0 },
    { label: TICKET_TYPES[1], value: stats.byType[TICKET_TYPES[1]] ?? 0 },
  ];

  return (
    <Section title="Comp Tickets">
      <p className="text-sm text-muted-foreground">
        Track complimentary tickets and recipients for this event.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-md border p-3">
            <p className="text-2xl">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
      {tickets.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Recipient</th>
                <th className="px-3 py-2 font-medium">Ticket type</th>
                <th className="px-3 py-2 font-medium">Quantity</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="px-3 py-2">{t.recipient}</td>
                  <td className="px-3 py-2">{t.ticketType}</td>
                  <td className="px-3 py-2">{t.quantity}</td>
                  <td className="px-3 py-2">{t.status}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      aria-label={`Remove tickets for ${t.recipient}`}
                      onClick={() => onChange(tickets.filter((x) => x.id !== t.id))}
                      className="rounded p-1 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_5rem_auto] sm:items-end">
        <div className="grid gap-1.5">
          <Label htmlFor="comp-recipient">Recipient</Label>
          <Input
            id="comp-recipient"
            value={recipient}
            autoComplete="off"
            onChange={(e) => {
              setRecipient(e.target.value);
              setError("");
            }}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="comp-type">Ticket type</Label>
          <Select value={ticketType} onValueChange={setTicketType}>
            <SelectTrigger id="comp-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TICKET_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="comp-qty">Quantity</Label>
          <Input
            id="comp-qty"
            type="number"
            min={1}
            step={1}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setError("");
            }}
          />
        </div>
        <Button type="button" onClick={issue}>
          Issue Comp Tickets
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </Section>
  );
}

/** Picture and description: the top of the event form. Only the picture's file name is kept. */
export function PictureAndDescription({
  extras,
  onChange,
}: {
  extras: EventExtras;
  onChange: (patch: Partial<EventExtras>) => void;
}) {
  return (
    <>
      <Section title="Picture">
        <Input
          type="file"
          accept="image/*"
          aria-label="Upload picture"
          onChange={(e) => onChange({ picture: e.target.files?.[0]?.name ?? "" })}
        />
        <p className="text-sm text-muted-foreground">
          {extras.picture ? `Chosen: ${extras.picture}` : "Select a picture to upload."}
        </p>
      </Section>
      <Section title="Description">
        <Textarea
          aria-label="Description"
          rows={6}
          value={extras.description}
          placeholder="Add a detailed description of the event, goals, and expected outcome."
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </Section>
    </>
  );
}

/**
 * Priority, labels, reminders, guests, tickets and (when asked) comp tickets: the
 * lower part of the event form. `sponsors` is an optional block shown between
 * guests and tickets, because the two screens handle sponsors differently.
 */
export function LowerExtras({
  extras,
  onChange,
  sponsors,
  showCompTickets,
}: {
  extras: EventExtras;
  onChange: (patch: Partial<EventExtras>) => void;
  sponsors?: React.ReactNode;
  showCompTickets?: boolean;
}) {
  return (
    <>
      <PriorityPicker value={extras.priority} onChange={(priority) => onChange({ priority })} />
      <ToggleChips
        title="Labels"
        options={EVENT_LABELS.map((l) => ({ value: l, label: l }))}
        selected={extras.labels}
        onToggle={(l) => onChange({ labels: toggleItem(extras.labels, l) })}
      />
      <ToggleChips
        title="Reminders"
        options={EVENT_REMINDERS}
        selected={extras.reminders}
        onToggle={(r) => onChange({ reminders: toggleItem(extras.reminders, r as EventReminder) })}
      />
      <NameChips
        title="Guests"
        names={extras.guests}
        onChange={(guests) => onChange({ guests })}
        placeholder="Add a guest"
      />
      {sponsors}
      <ToggleChips
        title="Tickets"
        options={TICKET_TYPES.map((t) => ({ value: t, label: t }))}
        selected={extras.tickets}
        onToggle={(t) => onChange({ tickets: toggleItem(extras.tickets, t) })}
      />
      {showCompTickets && (
        <CompTicketsSection
          tickets={extras.compTickets}
          onChange={(compTickets) => onChange({ compTickets })}
        />
      )}
    </>
  );
}
