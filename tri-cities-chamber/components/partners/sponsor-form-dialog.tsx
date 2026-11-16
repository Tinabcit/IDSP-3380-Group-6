"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
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
import type { CompTicket } from "@/components/partners/give-comp-tickets-dialog";
import { DEFAULT_SPONSOR_TODOS, SPONSOR_LEVELS, validateSponsorInput } from "@/lib/planner/sponsors";
import type { Sponsor, SponsorInput, SponsorLevel, SponsorStatus } from "@/lib/planner/types";

/** One line of the comp ticket table. */
interface CompRow {
  id: string;
  eventName: string;
  date?: string;
  ticketType: string;
  quantity: number;
  status: string;
}

/** Sample lines shown until the sponsor has real comp tickets, as in the design. */
const EXAMPLE_COMP_ROWS: CompRow[] = [
  { id: "ex-1", eventName: "Community Gala", date: "Dec 12, 2026", ticketType: "General Admission", quantity: 4, status: "Issued" },
  { id: "ex-2", eventName: "Partner Reception", date: "Jan 15, 2027", ticketType: "VIP Access", quantity: 2, status: "Issued" },
  { id: "ex-3", eventName: "Spring Benefit", date: "Mar 20, 2027", ticketType: "General Admission", quantity: 2, status: "Issued" },
];

/** What the dialog is doing: adding a new sponsor, or editing an existing one. */
export type SponsorFormState = { mode: "create" } | { mode: "edit"; sponsor: Sponsor };

/** The information SponsorFormDialog needs. */
interface SponsorFormDialogProps {
  /** null keeps the dialog closed. */
  state: SponsorFormState | null;
  onClose: () => void;
  /** Called with the checked values; sponsorId is set when editing. Save makes a draft, Publish makes it active. */
  onSubmit: (input: SponsorInput, sponsorId?: string) => void;
  /** Comp tickets already given to the sponsor being edited. */
  compTickets?: CompTicket[];
  /** Turns an event name into a short date like "Dec 12, 2026", or undefined if unknown. */
  eventDateFor?: (eventName: string) => string | undefined;
  /** Called with the sponsor name when "Issue Comp Tickets" is clicked. */
  onIssueCompTickets?: (sponsorName: string) => void;
}

/**
 * The "Sponsor Information" pop-up. The form inside is only created while the
 * pop-up is open, so it starts fresh each time.
 */
export function SponsorFormDialog({
  state,
  onClose,
  onSubmit,
  compTickets = [],
  eventDateFor,
  onIssueCompTickets,
}: SponsorFormDialogProps) {
  return (
    <Dialog open={state !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-4xl [&>button]:hidden">
        {state && (
          <SponsorForm
            key={state.mode === "edit" ? state.sponsor.id : "new"}
            state={state}
            onClose={onClose}
            onSubmit={onSubmit}
            compTickets={compTickets}
            eventDateFor={eventDateFor}
            onIssueCompTickets={onIssueCompTickets}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** The form: header with Save and Publish, contact details, additional details and the to do list. */
function SponsorForm({
  state,
  onClose,
  onSubmit,
  compTickets,
  eventDateFor,
  onIssueCompTickets,
}: {
  state: SponsorFormState;
  onClose: () => void;
  onSubmit: SponsorFormDialogProps["onSubmit"];
  compTickets: CompTicket[];
  eventDateFor?: SponsorFormDialogProps["eventDateFor"];
  onIssueCompTickets?: SponsorFormDialogProps["onIssueCompTickets"];
}) {
  const editing = state.mode === "edit" ? state.sponsor : null;
  const [name, setName] = useState(editing?.name ?? "");
  const [email, setEmail] = useState(editing?.contactEmail ?? "");
  const [phone, setPhone] = useState(editing?.contactPhone ?? "");
  const [website, setWebsite] = useState(editing?.website ?? "");
  const [level, setLevel] = useState<SponsorLevel | "">(editing?.level ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [todos, setTodos] = useState(editing?.todos ?? DEFAULT_SPONSOR_TODOS);
  const [error, setError] = useState("");
  const showingExamples = compTickets.length === 0;
  const rows: CompRow[] = showingExamples
    ? EXAMPLE_COMP_ROWS
    : compTickets.map((t) => ({
        id: t.id,
        eventName: t.eventName || "No event",
        date: t.eventName ? eventDateFor?.(t.eventName) : undefined,
        ticketType: t.ticketType,
        quantity: t.quantity,
        status: t.status,
      }));
  const totalComps = rows.reduce((n, r) => n + r.quantity, 0);
  const eventCount = new Set(rows.map((r) => r.eventName)).size;

  /** Checks the values, then passes them up with the chosen status and closes the pop-up. */
  function submit(status: SponsorStatus) {
    const input: SponsorInput = {
      name: name.trim(),
      contactName: editing?.contactName,
      contactEmail: email.trim() || undefined,
      contactPhone: phone.trim() || undefined,
      website: website.trim() || undefined,
      level: level || undefined,
      notes: notes.trim() || undefined,
      status,
      todos,
    };
    const problem = validateSponsorInput(input);
    if (problem) return setError(problem);
    onSubmit(input, editing?.id);
    onClose();
  }

  /** Clears the error message when the person starts fixing the form. */
  function clearError() {
    setError("");
  }

  /** Asks the page to open the comp ticket form for this sponsor. */
  function issueComps() {
    onIssueCompTickets?.(name.trim());
  }

  /** Ticks or unticks one to do line. */
  function toggleTodo(id: string, done: boolean) {
    setTodos((list) => list.map((t) => (t.id === id ? { ...t, done } : t)));
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit("draft");
      }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b p-6">
        <div>
          <DialogTitle className="text-3xl font-bold">Sponsor Information</DialogTitle>
          <DialogDescription>Enter sponsor details for the current project.</DialogDescription>
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="outline" size="sm">
            Save
          </Button>
          <Button type="button" size="sm" className="rounded-full" onClick={() => submit("active")}>
            Publish
          </Button>
        </div>
      </header>

      <div className="grid gap-6 p-6">
        <div className="grid gap-6 rounded-xl border p-5">
          <section className="grid gap-4" aria-labelledby="sp-contact">
            <h3 id="sp-contact" className="text-base font-semibold">
              Contact Details
            </h3>
            <div className="grid gap-2">
              <Label htmlFor="sp-name">Sponsor Name</Label>
              <Input
                id="sp-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError();
                }}
                placeholder="e.g. Northstar Events"
                autoComplete="off"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sp-email">Email Address</Label>
              <Input
                id="sp-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                placeholder="sponsor@company.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sp-phone">Phone Number</Label>
              <Input
                id="sp-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </section>

          <section className="grid gap-4" aria-labelledby="sp-additional">
            <h3 id="sp-additional" className="text-base font-semibold">
              Additional Details
            </h3>
            <div className="grid gap-2">
              <Label htmlFor="sp-website">Company Website</Label>
              <Input
                id="sp-website"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  clearError();
                }}
                placeholder="https://www.sponsorcompany.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sp-level">Sponsorship Level</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as SponsorLevel)}>
                <SelectTrigger id="sp-level">
                  <SelectValue placeholder="Select level (e.g. Platinum, Gold, Silver)" />
                </SelectTrigger>
                <SelectContent>
                  {SPONSOR_LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sp-notes" className="text-muted-foreground">
                Notes
              </Label>
              <Textarea
                id="sp-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="bg-muted/50"
                placeholder="Add any specific requirements or instructions for the sponsor..."
              />
            </div>
          </section>

          <section className="grid gap-3" aria-labelledby="sp-comps">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 id="sp-comps" className="text-base font-semibold">
                  Comp Tickets by Event
                </h3>
                <p className="text-sm">All events with complimentary tickets allocated to this sponsor.</p>
              </div>
              <Button type="button" size="sm" onClick={issueComps}>
                Issue Comp Tickets
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-24 gap-y-2 py-3 text-sm">
              <p>
                <span className="mr-2 text-2xl">{eventCount}</span>Events with comp tickets
              </p>
              <p>
                <span className="mr-2 text-2xl">{totalComps}</span>Total comp tickets
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-normal">Event</th>
                    <th className="px-4 py-3 font-normal">Ticket type</th>
                    <th className="px-4 py-3 font-normal">Tickets</th>
                    <th className="px-4 py-3 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-4">
                        <div>{r.eventName}</div>
                        {r.date && <div className="text-xs text-muted-foreground">{r.date}</div>}
                      </td>
                      <td className="px-4 py-4">{r.ticketType}</td>
                      <td className="px-4 py-4 font-semibold">{r.quantity}</td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <p>
                Showing all {eventCount} events &middot; {totalComps} comp tickets
              </p>
              {showingExamples && <p className="text-xs text-muted-foreground">Example allocations</p>}
            </div>
          </section>

          <section className="grid gap-3" aria-labelledby="sp-todos">
            <h3 id="sp-todos" className="text-base font-semibold">
              To Do List
            </h3>
            <ul className="grid gap-2">
              {todos.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
                  <Checkbox
                    id={`sp-todo-${t.id}`}
                    checked={t.done}
                    onCheckedChange={(v) => toggleTodo(t.id, v === true)}
                  />
                  <Label
                    htmlFor={`sp-todo-${t.id}`}
                    className={t.done ? "font-normal text-muted-foreground line-through" : "font-normal"}
                  >
                    {t.title}
                  </Label>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
