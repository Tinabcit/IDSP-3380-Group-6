"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileUp, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";

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
import { buildDemoSummary, formatCurrency, simulateExtraction } from "@/lib/planner/contracts";
import { formatShortDate, shiftISODate } from "@/lib/planner/dates";
import type { Deliverable, PaymentInstalment } from "@/lib/planner/types";

/** Special dropdown value that means "no event chosen". */
const NONE = "none";
/** Special dropdown value that means "add a new partner using the name typed in". */
const NEW_PARTNER = "new";

/**
 * Makes a unique id for each payment/deliverable row added in the form
 * (the form needs ids before the contract is saved).
 */
let rowCounter = 0;
const rowId = (prefix: string) => `${prefix}-${Date.now()}-${rowCounter++}`;

/** Error messages to show under fields that were filled in wrong. */
interface Errors {
  sponsor?: string;
  title?: string;
  amount?: string;
}

/**
 * The "New contract" page (/contracts/new).
 * You can upload a file (we pretend to read it and fill the fields in), then
 * check or edit the partner, event, amount, payments and deliverables.
 * On save it creates the contract plus reminder tasks on the calendar, then
 * takes you to the new contract's page.
 */
export function ContractForm() {
  const data = usePlannerData();
  const { today } = data;
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | undefined>();
  const [reading, setReading] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  const [sponsorId, setSponsorId] = useState<string>("");
  const [newPartner, setNewPartner] = useState("");
  const [eventId, setEventId] = useState<string>(NONE);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [signedDate, setSignedDate] = useState<string>(today);
  const [payments, setPayments] = useState<PaymentInstalment[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [assigneeId, setAssigneeId] = useState(data.currentUserId);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const sortedEvents = [...data.events].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const amountNumber = Number(amount);
  const scheduled = payments.reduce((n, p) => n + p.amount, 0);

  /**
   * Runs when a file is chosen. After a short pretend "reading" delay it fills
   * the form with best guesses (see simulateExtraction).
   */
  function handleFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setReading(true);
    // Stand-in for real extraction: wait a moment, then fill in best guesses.
    window.setTimeout(() => {
      const guess = simulateExtraction(file.name, data.sponsors, data.events, {
        today,
        deposit: shiftISODate(today, 14),
        balance: shiftISODate(today, 45),
      });
      if (guess.sponsorId) setSponsorId(guess.sponsorId);
      if (guess.eventId) setEventId(guess.eventId);
      if (guess.title) setTitle(guess.title);
      if (guess.amount) setAmount(String(guess.amount));
      if (guess.payments) {
        setPayments(guess.payments.map((p) => ({ ...p, id: rowId("pay") })));
      }
      setErrors({});
      setAutoFilled(true);
      setReading(false);
    }, 900);
  }

  /** Adds an empty payment row, due in 30 days. */
  function addPayment() {
    setPayments((rows) => [
      ...rows,
      {
        id: rowId("pay"),
        label: rows.length === 0 ? "Full payment" : `Instalment ${rows.length + 1}`,
        dueDate: shiftISODate(today, 30),
        amount: 0,
        paid: false,
      },
    ]);
  }

  /** Adds an empty deliverable row, due in 14 days. */
  function addDeliverable() {
    setDeliverables((rows) => [
      ...rows,
      { id: rowId("del"), label: "", dueDate: shiftISODate(today, 14), done: false },
    ]);
  }

  /**
   * Runs when you press Save. Checks that a partner, a title and an amount were
   * entered. If so, it adds the new partner (if needed), tidies the rows,
   * saves the contract and opens it.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    const creatingPartner = sponsorId === NEW_PARTNER;
    if (!sponsorId || (creatingPartner && !newPartner.trim())) {
      next.sponsor = creatingPartner ? "Enter the partner's name." : "Choose a partner.";
    }
    if (!title.trim()) next.title = "Enter a contract title.";
    if (!(amountNumber > 0)) next.amount = "Enter the total sponsorship amount.";
    if (next.sponsor || next.title || next.amount) {
      setErrors(next);
      return;
    }

    const finalSponsorId = creatingPartner
      ? data.addSponsor({ name: newPartner.trim() })
      : sponsorId;
    const sponsorName = creatingPartner
      ? newPartner.trim()
      : (data.lookups.sponsorsById.get(sponsorId)?.name ?? "The partner");
    const event = eventId === NONE ? undefined : data.lookups.eventsById.get(eventId);

    const cleanPayments = payments.map((p, i) => ({
      ...p,
      label: p.label.trim() || `Payment ${i + 1}`,
    }));
    const cleanDeliverables = deliverables
      .filter((d) => d.label.trim())
      .map((d) => ({ ...d, label: d.label.trim() }));
    const input = {
      title: title.trim(),
      sponsorId: finalSponsorId,
      eventId: event?.id,
      amount: amountNumber,
      status: signedDate ? ("active" as const) : ("draft" as const),
      signedDate: signedDate || undefined,
      fileName,
      payments: cleanPayments,
      deliverables: cleanDeliverables,
      notes: notes.trim() || undefined,
    };

    const id = data.addContract(
      { ...input, summary: buildDemoSummary(input, sponsorName, event?.name) },
      { assigneeId }
    );
    router.push(`/contracts/${id}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto grid max-w-2xl gap-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-1 text-muted-foreground">
          <Link href="/contracts">
            <ArrowLeft />
            Contracts
          </Link>
        </Button>
        <h1 className="text-xl font-bold leading-tight">New contract</h1>
        <p className="text-sm text-muted-foreground">
          Upload the signed file and check what we found, or fill it in by hand. Reminders for
          every payment and deliverable are added to the calendar for you.
        </p>
      </div>

      <section aria-label="Upload" className="grid gap-3">
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.doc,.docx"
          className="sr-only"
          aria-label="Contract file"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={reading}
          className="flex w-full flex-col items-center gap-1.5 rounded-lg border-2 border-dashed bg-card px-4 py-8 text-center transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70"
        >
          {reading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
          ) : (
            <FileUp className="h-6 w-6 text-primary" aria-hidden />
          )}
          <span className="font-medium">
            {reading
              ? "Reading contract"
              : fileName
                ? fileName
                : "Upload the contract (PDF or Word)"}
          </span>
          <span className="text-sm text-muted-foreground">
            {fileName && !reading ? "Choose a different file" : "Tap to choose a file"}
          </span>
        </button>
        {autoFilled && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-md bg-signature-soft px-3 py-2 text-sm text-signature-foreground"
          >
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              Demo: these fields were guessed from the file name. Check every one before saving.
              The finished version will read the contract itself.
            </span>
          </p>
        )}
      </section>

      <fieldset className="grid gap-4">
        <legend className="mb-1 text-base font-semibold">Details</legend>

        <div className="grid gap-2">
          <Label htmlFor="c-partner">Partner</Label>
          <Select value={sponsorId} onValueChange={setSponsorId}>
            <SelectTrigger id="c-partner" aria-invalid={Boolean(errors.sponsor)}>
              <SelectValue placeholder="Choose a partner" />
            </SelectTrigger>
            <SelectContent>
              {data.sponsors.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
              <SelectItem value={NEW_PARTNER}>Add a new partner</SelectItem>
            </SelectContent>
          </Select>
          {sponsorId === NEW_PARTNER && (
            <Input
              value={newPartner}
              onChange={(e) => setNewPartner(e.target.value)}
              placeholder="New partner name"
              aria-label="New partner name"
              autoComplete="off"
            />
          )}
          {errors.sponsor && <p className="text-sm text-destructive">{errors.sponsor}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="c-event">Event</Label>
          <Select value={eventId} onValueChange={setEventId}>
            <SelectTrigger id="c-event">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Not tied to one event</SelectItem>
              {sortedEvents.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name} ({formatShortDate(event.startDate)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="c-title">Contract title</Label>
          <Input
            id="c-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Gala Presenting Sponsor"
            autoComplete="off"
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="c-amount">Total amount (CAD)</Label>
            <Input
              id="c-amount"
              type="number"
              inputMode="decimal"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5000"
              aria-invalid={Boolean(errors.amount)}
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c-signed">
              Date signed <span className="font-normal text-muted-foreground">(blank = draft)</span>
            </Label>
            <Input
              id="c-signed"
              type="date"
              value={signedDate}
              onChange={(e) => setSignedDate(e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-base font-semibold">Payments</legend>
        {payments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Add each instalment so a reminder lands on the calendar.
          </p>
        )}
        {payments.map((p, i) => (
          <div key={p.id} className="grid gap-2 rounded-md border bg-card p-3 sm:grid-cols-[1fr_9rem_7rem_auto] sm:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor={`pay-label-${p.id}`} className="text-xs">Label</Label>
              <Input
                id={`pay-label-${p.id}`}
                value={p.label}
                onChange={(e) =>
                  setPayments((rows) => rows.map((r) => (r.id === p.id ? { ...r, label: e.target.value } : r)))
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`pay-date-${p.id}`} className="text-xs">Due</Label>
              <Input
                id={`pay-date-${p.id}`}
                type="date"
                value={p.dueDate}
                onChange={(e) =>
                  setPayments((rows) => rows.map((r) => (r.id === p.id ? { ...r, dueDate: e.target.value } : r)))
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`pay-amt-${p.id}`} className="text-xs">Amount</Label>
              <Input
                id={`pay-amt-${p.id}`}
                type="number"
                inputMode="decimal"
                min={0}
                value={p.amount || ""}
                onChange={(e) =>
                  setPayments((rows) => rows.map((r) => (r.id === p.id ? { ...r, amount: Number(e.target.value) } : r)))
                }
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove payment ${i + 1}`}
              onClick={() => setPayments((rows) => rows.filter((r) => r.id !== p.id))}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        {payments.length > 0 && amountNumber > 0 && scheduled !== amountNumber && (
          <p role="status" className="text-sm text-overdue">
            Payments add up to {formatCurrency(scheduled)}, but the contract total is{" "}
            {formatCurrency(amountNumber)}.
          </p>
        )}
        <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={addPayment}>
          <Plus />
          Add payment
        </Button>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-base font-semibold">What we owe the partner</legend>
        {deliverables.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Logo placement, tickets, a speaking slot, anything promised in the contract.
          </p>
        )}
        {deliverables.map((d, i) => (
          <div key={d.id} className="grid gap-2 rounded-md border bg-card p-3 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor={`del-label-${d.id}`} className="text-xs">Deliverable</Label>
              <Input
                id={`del-label-${d.id}`}
                value={d.label}
                onChange={(e) =>
                  setDeliverables((rows) => rows.map((r) => (r.id === d.id ? { ...r, label: e.target.value } : r)))
                }
                placeholder="e.g. Logo in event program"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`del-date-${d.id}`} className="text-xs">Due</Label>
              <Input
                id={`del-date-${d.id}`}
                type="date"
                value={d.dueDate}
                onChange={(e) =>
                  setDeliverables((rows) => rows.map((r) => (r.id === d.id ? { ...r, dueDate: e.target.value } : r)))
                }
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove deliverable ${i + 1}`}
              onClick={() => setDeliverables((rows) => rows.filter((r) => r.id !== d.id))}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={addDeliverable}>
          <Plus />
          Add deliverable
        </Button>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-1 text-base font-semibold">Follow-up</legend>
        <div className="grid gap-2">
          <Label htmlFor="c-assignee">Who gets the reminders</Label>
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger id="c-assignee">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {data.staff.map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="c-notes">
            Notes <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea id="c-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>
      </fieldset>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button asChild variant="outline">
          <Link href="/contracts">Cancel</Link>
        </Button>
        <Button type="submit" disabled={reading}>
          Save contract
        </Button>
      </div>
    </form>
  );
}
