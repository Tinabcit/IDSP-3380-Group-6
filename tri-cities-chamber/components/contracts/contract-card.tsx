import Link from "next/link";
import { CalendarClock, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  amountPaid,
  formatCurrency,
  isContractOverdue,
  nextDueDate,
} from "@/lib/planner/contracts";
import { describeRelativeDay } from "@/lib/planner/dates";
import type { Contract, ISODate } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

import type { PlannerLookups } from "@/components/planner/lookups";

export function ContractStatusBadge({ status }: { status: Contract["status"] }) {
  if (status === "completed") return <Badge variant="secondary">Completed</Badge>;
  if (status === "draft") return <Badge variant="outline">Draft</Badge>;
  return <Badge variant="default">Active</Badge>;
}

interface ContractCardProps {
  contract: Contract;
  today: ISODate;
  lookups: PlannerLookups;
}

export function ContractCard({ contract, today, lookups }: ContractCardProps) {
  const sponsor = lookups.sponsorsById.get(contract.sponsorId);
  const event = contract.eventId ? lookups.eventsById.get(contract.eventId) : undefined;
  const pillar = event ? lookups.pillarsById.get(event.pillarId) : undefined;
  const paid = amountPaid(contract);
  const percent = contract.amount > 0 ? Math.round((paid / contract.amount) * 100) : 0;
  const next = nextDueDate(contract);
  const overdue = isContractOverdue(contract, today);

  return (
    <li>
      <Link
        href={`/contracts/${contract.id}`}
        className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">{sponsor?.name ?? "Unknown partner"}</span>
            <ContractStatusBadge status={contract.status} />
            {overdue && <Badge variant="overdue">Overdue item</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{contract.title}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
            {event && (
              <span className="inline-flex items-center gap-1.5">
                {event.isSignature && (
                  <span
                    role="img"
                    aria-label="Signature event"
                    className="h-2 w-2 rounded-full bg-signature"
                  />
                )}
                {event.name}
              </span>
            )}
            {pillar && <span>{pillar.name}</span>}
            {next && (
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  overdue && "font-medium text-overdue"
                )}
              >
                <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                Next: {describeRelativeDay(next, today)}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="font-semibold">{formatCurrency(contract.amount)}</div>
          <div className="text-xs text-muted-foreground">{percent}% paid</div>
        </div>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </li>
  );
}
