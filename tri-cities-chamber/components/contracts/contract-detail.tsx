"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, FileText, Mail, MapPin, Phone, Sparkles, Trash2 } from "lucide-react";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { amountPaid, formatCurrency } from "@/lib/planner/contracts";
import { describeRelativeDay, formatShortDate, isISODateBefore } from "@/lib/planner/dates";
import type { Contract } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

import { ActivityList } from "./activity-list";
import { ContractStatusBadge } from "./contract-card";

/**
 * The page for one contract (/contracts/:id). It shows:
 * - money received so far
 * - a summary of the contract
 * - checklists for payments and deliverables (ticking one also ticks the matching
 *   task on the calendar)
 * - the partner's contact info, a status dropdown and a delete button
 * - the history of changes to this contract
 * If the id does not exist, it shows a "Contract not found" message.
 */
export function ContractDetail({ id }: { id: string }) {
  const data = usePlannerData();
  const router = useRouter();
  const { today, lookups } = data;
  const contract = data.contracts.find((c) => c.id === id);

  if (!contract) {
    return (
      <div className="mx-auto grid max-w-md gap-3 py-16 text-center">
        <h1 className="text-xl font-bold">Contract not found</h1>
        <p className="text-sm text-muted-foreground">
          It may have been deleted. Head back to the list to find it.
        </p>
        <Button asChild className="justify-self-center">
          <Link href="/contracts">All contracts</Link>
        </Button>
      </div>
    );
  }

  const sponsor = lookups.sponsorsById.get(contract.sponsorId);
  const event = contract.eventId ? lookups.eventsById.get(contract.eventId) : undefined;
  const pillar = event ? lookups.pillarsById.get(event.pillarId) : undefined;
  const paid = amountPaid(contract);
  const percent = contract.amount > 0 ? Math.round((paid / contract.amount) * 100) : 0;
  const history = data.activity.filter((a) => a.contractId === contract.id);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-1 text-muted-foreground">
          <Link href="/contracts">
            <ArrowLeft />
            Contracts
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold leading-tight">{contract.title}</h1>
            <p className="text-muted-foreground">{sponsor?.name ?? "Unknown partner"}</p>
          </div>
          <ContractStatusBadge status={contract.status} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {event && (
            <span className="inline-flex items-center gap-1.5">
              {event.isSignature && <Badge variant="signature">Signature</Badge>}
              {event.name}, {formatShortDate(event.startDate)}
            </span>
          )}
          {pillar && <span>{pillar.name}</span>}
          {event?.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {event.location}
            </span>
          )}
        </div>
      </div>

      <section aria-label="Money" className="rounded-lg border bg-card p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-bold">{formatCurrency(contract.amount)}</span>
          <span className="text-sm text-muted-foreground">
            {formatCurrency(paid)} received ({percent}%)
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Share of contract paid"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full bg-done" style={{ width: `${percent}%` }} />
        </div>
      </section>

      {contract.summary ? (
        <section aria-labelledby="summary-heading" className="grid gap-3 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 id="summary-heading" className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="h-4 w-4 text-signature" aria-hidden />
              Summary
            </h2>
            <Badge variant="outline">Demo summary</Badge>
          </div>
          <p className="text-[15px]">{contract.summary.overview}</p>
          {contract.summary.keyTerms.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {contract.summary.keyTerms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          )}
          {contract.summary.watchouts.length > 0 && (
            <div className="rounded-md bg-overdue-soft p-3">
              <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-overdue">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                Double-check
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {contract.summary.watchouts.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : null}

      <Checklist
        title="Payments"
        empty="No payments recorded."
        items={contract.payments.map((p) => ({
          id: p.id,
          label: p.label,
          detail: formatCurrency(p.amount),
          dueDate: p.dueDate,
          done: p.paid,
          doneLabel: "Paid",
        }))}
        today={today}
        onToggle={(itemId) => data.toggleContractItem(contract.id, itemId)}
      />

      <Checklist
        title="What we owe the partner"
        empty="No deliverables recorded."
        items={contract.deliverables.map((d) => ({
          id: d.id,
          label: d.label,
          dueDate: d.dueDate,
          done: d.done,
          doneLabel: "Done",
        }))}
        today={today}
        onToggle={(itemId) => data.toggleContractItem(contract.id, itemId)}
      />

      <section aria-labelledby="doc-heading" className="grid gap-2">
        <h2 id="doc-heading" className="text-base font-semibold">
          Contract file
        </h2>
        {contract.fileName ? (
          <div className="flex items-center gap-3 rounded-md border bg-card px-3 py-2.5 text-sm">
            <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{contract.fileName}</span>
            <span className="text-xs text-muted-foreground">Stored once file storage is connected</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No file attached.</p>
        )}
        {contract.signedDate && (
          <p className="text-sm text-muted-foreground">
            Signed {formatShortDate(contract.signedDate)}.
          </p>
        )}
        {contract.notes && <p className="text-sm">{contract.notes}</p>}
      </section>

      {sponsor && (sponsor.contactName || sponsor.contactEmail || sponsor.contactPhone) && (
        <section aria-labelledby="contact-heading" className="grid gap-1.5">
          <h2 id="contact-heading" className="text-base font-semibold">
            Partner contact
          </h2>
          {sponsor.contactName && <p className="text-sm">{sponsor.contactName}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {sponsor.contactEmail && (
              <a
                href={`mailto:${sponsor.contactEmail}`}
                className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden />
                {sponsor.contactEmail}
              </a>
            )}
            {sponsor.contactPhone && (
              <a
                href={`tel:${sponsor.contactPhone}`}
                className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {sponsor.contactPhone}
              </a>
            )}
          </div>
        </section>
      )}

      <section aria-labelledby="history-heading" className="grid gap-3 border-t pt-6">
        <h2 id="history-heading" className="text-base font-semibold">
          History
        </h2>
        <ActivityList entries={history} lookups={lookups} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status</span>
          <Select
            value={contract.status}
            onValueChange={(v) => data.setContractStatus(contract.id, v as Contract["status"])}
          >
            <SelectTrigger aria-label="Contract status" className="h-9 w-auto gap-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-muted-foreground hover:text-destructive">
              <Trash2 />
              Delete contract
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this contract?</AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{contract.title}&rdquo; and its calendar reminders will be removed for
                everyone. Download a backup first if you might need it. This can&rsquo;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep contract</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  data.deleteContract(contract.id);
                  router.push("/contracts");
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete contract
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

/**
 * The common shape for a checklist row. Payments and deliverables are
 * converted into this so one Checklist component can show both.
 */
interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
  dueDate: string;
  done: boolean;
  doneLabel: string;
}

/**
 * A checklist box used for both Payments and Deliverables.
 * Each row has a checkbox, a name, an optional amount and a due date.
 * Unticked rows that are past due are shown in red.
 */
function Checklist({
  title,
  empty,
  items,
  today,
  onToggle,
}: {
  title: string;
  empty: string;
  items: ChecklistItem[];
  today: string;
  onToggle: (id: string) => void;
}) {
  const headingId = `list-${title.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <section aria-labelledby={headingId} className="grid gap-2">
      <h2 id={headingId} className="text-base font-semibold">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="grid gap-2">
          {items.map((item) => {
            const overdue = !item.done && isISODateBefore(item.dueDate, today);
            const boxId = `item-${item.id}`;
            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-md border-l-[3px] bg-card py-3 pl-3 pr-4",
                  overdue ? "border-l-overdue" : item.done ? "border-l-done/60" : "border-l-primary/70"
                )}
              >
                <Checkbox
                  id={boxId}
                  checked={item.done}
                  onCheckedChange={() => onToggle(item.id)}
                />
                <label
                  htmlFor={boxId}
                  className={cn(
                    "min-w-0 flex-1 cursor-pointer text-[15px] font-medium leading-snug",
                    item.done && "text-muted-foreground line-through"
                  )}
                >
                  {item.label}
                  <span className="sr-only">{item.done ? `, ${item.doneLabel}` : ""}</span>
                </label>
                <div className="shrink-0 text-right text-[13px]">
                  {item.detail && <div className="font-semibold">{item.detail}</div>}
                  <div className={cn("text-muted-foreground", overdue && "font-medium text-overdue")}>
                    {describeRelativeDay(item.dueDate, today)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
