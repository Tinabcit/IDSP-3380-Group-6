
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { usePlannerData } from "@/components/app-shell/planner-provider";
import { FilterBar } from "@/components/planner/filter-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  amountPaid,
  filterContracts,
  formatCurrency,
  groupContracts,
  isContractOverdue,
  sortContracts,
} from "@/lib/planner/contracts";

// New: classify expiration and renewal deadlines.
import { getContractDeadlineStatus } from "@/lib/planner/contract-reminders";
import { formatShortDate } from "@/lib/planner/dates";

import {
  EMPTY_FILTERS,
  type ContractGroupBy,
  type ContractSortBy,
  type PlannerFilters,
} from "@/lib/planner/types";

import { ActivityList } from "./activity-list";
import { ContractCard } from "./contract-card";

/** The words shown in the "group by" dropdown. */
const GROUP_LABELS: Record<ContractGroupBy, string> = {
  none: "No grouping",
  event: "Group by event",
  pillar: "Group by pillar",
  partner: "Group by partner",
};

/** The words shown in the "sort by" dropdown. */
const SORT_LABELS: Record<ContractSortBy, string> = {
  nextDue: "Next due first",
  amount: "Highest value",
  partner: "Partner A to Z",
  title: "Title A to Z",
};

/** New: identifies the kind of contract reminder. */
type ReminderKind = "expiration" | "renewal";

/** New: describes one contract deadline reminder. */
interface ContractReminder {
  id: string;
  contractId: string;
  title: string;
  kind: ReminderKind;
  deadline: string;
  status: "expired" | "urgent" | "upcoming";
}

/**
 * The contracts list page (/contracts). It remembers the search text, filters,
 * grouping and sorting. The contracts go through three steps - filter, sort,
 * group (functions in lib/planner/contracts.ts) - and are then shown as cards.
 * It also shows totals at the top and recent changes at the bottom.
 *
 * New: displays contract expiration and renewal reminders.
 */
export function ContractsPage() {
  const data = usePlannerData();
  const { today, lookups, contracts } = data;

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<PlannerFilters>(EMPTY_FILTERS);
  const [groupBy, setGroupBy] = useState<ContractGroupBy>("event");
  const [sortBy, setSortBy] = useState<ContractSortBy>("nextDue");

  const groups = useMemo(() => {
    const filtered = filterContracts(contracts, filters, query, lookups);
    return groupContracts(
      sortContracts(filtered, sortBy, lookups),
      groupBy,
      lookups
    );
  }, [contracts, filters, query, lookups, groupBy, sortBy]);

  const shown = groups.reduce((n, g) => n + g.contracts.length, 0);

  const totals = useMemo(
    () => ({
      value: contracts.reduce((n, c) => n + c.amount, 0),
      paid: contracts.reduce((n, c) => n + amountPaid(c), 0),
      attention: contracts.filter((c) => isContractOverdue(c, today)).length,
    }),
    [contracts, today]
  );

  /**
   * New: collects upcoming contract expiration and renewal deadlines.
   * Each contract can have an expiration reminder and a renewal reminder.
   * Completed contracts are excluded.
   */
  const reminders = useMemo(() => {
    const results: ContractReminder[] = [];

    for (const contract of contracts) {
      if (contract.status === "completed") {
        continue;
      }

      const deadlines: {
        kind: ReminderKind;
        deadline: string | undefined;
      }[] = [
        {
          kind: "expiration",
          deadline: contract.expirationDate,
        },
        {
          kind: "renewal",
          deadline: contract.renewalDate,
        },
      ];

      for (const item of deadlines) {
        const status = getContractDeadlineStatus(
          item.deadline,
          today
        );

        if (
          !item.deadline ||
          (status !== "expired" &&
            status !== "urgent" &&
            status !== "upcoming")
        ) {
          continue;
        }

        results.push({
          id: `${contract.id}-${item.kind}`,
          contractId: contract.id,
          title: contract.title,
          kind: item.kind,
          deadline: item.deadline,
          status,
        });
      }
    }

    // New: show expired deadlines first, followed by urgent and upcoming.
    const priority = {
      expired: 0,
      urgent: 1,
      upcoming: 2,
    };

    return results.sort(
      (a, b) =>
        priority[a.status] - priority[b.status] ||
        a.deadline.localeCompare(b.deadline)
    );
  }, [contracts, today]);

  /** New: counts the reminders in each deadline category. */
  const reminderTotals = useMemo(
    () => ({
      expired: reminders.filter(
        (reminder) => reminder.status === "expired"
      ).length,
      urgent: reminders.filter(
        (reminder) => reminder.status === "urgent"
      ).length,
      upcoming: reminders.filter(
        (reminder) => reminder.status === "upcoming"
      ).length,
    }),
    [reminders]
  );

  return (
    <div className="grid gap-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight">
            Contracts
          </h1>
          <p className="text-sm text-muted-foreground">
            Every sponsorship agreement, with what is owed and when.
          </p>
        </div>

        <Button asChild>
          <Link href="/contracts/new">
            <Plus />
            <span>
              <span className="sm:hidden">New</span>
              <span className="hidden sm:inline">
                New contract
              </span>
            </span>
          </Link>
        </Button>
      </header>

      <dl className="grid grid-cols-3 gap-3">
        <Stat
          label="Total value"
          value={formatCurrency(totals.value)}
        />
        <Stat
          label="Received"
          value={formatCurrency(totals.paid)}
        />
        <Stat
          label="Need attention"
          value={String(totals.attention)}
          tone={totals.attention > 0 ? "alert" : "normal"}
        />
      </dl>

      {/* New: Contract Renewal and Expiration Reminder Dashboard */}
      <section
        aria-labelledby="contract-reminders-heading"
        className="grid gap-4 rounded-lg border bg-card p-4"
      >
        <div>
          <h2
            id="contract-reminders-heading"
            className="text-base font-semibold"
          >
            Contract renewal and expiration reminders
          </h2>

          <p className="text-sm text-muted-foreground">
            Review contracts that have expired or have deadlines
            coming up within the next 30 days.
          </p>
        </div>

        {/* New: reminder summary totals */}
        <dl className="grid grid-cols-3 gap-3">
          <div className="rounded-md border p-3">
            <dt className="text-xs text-muted-foreground">
              Expired
            </dt>
            <dd className="text-lg font-bold text-overdue">
              {reminderTotals.expired}
            </dd>
          </div>

          <div className="rounded-md border p-3">
            <dt className="text-xs text-muted-foreground">
              Urgent (0–7 days)
            </dt>
            <dd className="text-lg font-bold text-overdue">
              {reminderTotals.urgent}
            </dd>
          </div>

          <div className="rounded-md border p-3">
            <dt className="text-xs text-muted-foreground">
              Upcoming (8–30 days)
            </dt>
            <dd className="text-lg font-bold">
              {reminderTotals.upcoming}
            </dd>
          </div>
        </dl>

        {/* New: list of contracts requiring deadline attention */}
        {reminders.length === 0 ? (
          <p className="rounded-md border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
            No contract renewal or expiration deadlines need
            attention within the next 30 days.
          </p>
        ) : (
          <ul className="grid gap-2">
            {reminders.map((reminder) => (
              <li
                key={reminder.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="grid gap-1">
                  <Link
                    href={`/contracts/${reminder.contractId}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    {reminder.title}
                  </Link>

                  <p className="text-xs text-muted-foreground">
                    {reminder.kind === "expiration"
                      ? "Contract expiration"
                      : "Renewal review"}{" "}
                    · {formatShortDate(reminder.deadline)}
                  </p>
                </div>

                <span
                  className={
                    reminder.status === "expired" ||
                    reminder.status === "urgent"
                      ? "rounded-full border px-2 py-1 text-xs font-semibold text-overdue"
                      : "rounded-full border px-2 py-1 text-xs font-semibold"
                  }
                >
                  {reminder.status === "expired"
                    ? "Expired"
                    : reminder.status === "urgent"
                      ? "Urgent"
                      : "Upcoming"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />

          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search partner, event or contract"
            aria-label="Search contracts"
            className="pl-9"
          />
        </div>

        <FilterBar
          label="Filter contracts"
          filters={filters}
          pillars={data.pillars}
          sponsors={data.sponsors}
          onChange={setFilters}
        />

        <div className="flex flex-wrap gap-2">
          <Select
            value={groupBy}
            onValueChange={(v) =>
              setGroupBy(v as ContractGroupBy)
            }
          >
            <SelectTrigger
              aria-label="Group contracts"
              className="h-9 w-auto gap-2"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {(Object.keys(GROUP_LABELS) as ContractGroupBy[]).map(
                (key) => (
                  <SelectItem key={key} value={key}>
                    {GROUP_LABELS[key]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(v) =>
              setSortBy(v as ContractSortBy)
            }
          >
            <SelectTrigger
              aria-label="Sort contracts"
              className="h-9 w-auto gap-2"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {(Object.keys(SORT_LABELS) as ContractSortBy[]).map(
                (key) => (
                  <SelectItem key={key} value={key}>
                    {SORT_LABELS[key]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p
        className="text-sm text-muted-foreground"
        aria-live="polite"
      >
        Showing {shown} of {contracts.length} contracts.
      </p>

      {shown === 0 ? (
        <div className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No contracts match. Try clearing the search or filters.
        </div>
      ) : (
        <div className="grid gap-6">
          {groups.map((group) => (
            <section
              key={group.key}
              aria-label={group.label || "All contracts"}
              className="grid gap-2"
            >
              {group.label && (
                <h2 className="flex items-baseline justify-between text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>{group.label}</span>

                  <span className="font-normal normal-case tracking-normal">
                    {formatCurrency(
                      group.contracts.reduce(
                        (n, c) => n + c.amount,
                        0
                      )
                    )}
                  </span>
                </h2>
              )}

              <ul className="grid gap-2">
                {group.contracts.map((c) => (
                  <ContractCard
                    key={c.id}
                    contract={c}
                    today={today}
                    lookups={lookups}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <section
        aria-labelledby="activity-heading"
        className="grid gap-3 border-t pt-6"
      >
        <h2
          id="activity-heading"
          className="text-base font-semibold"
        >
          Recent changes
        </h2>

        <ActivityList
          entries={data.activity.slice(0, 6)}
          lookups={lookups}
        />
      </section>
    </div>
  );
}

/**
 * A small box with a label and a big number (e.g. "Total value $50,000").
 * tone="alert" makes the number red.
 */
function Stat({
  label,
  value,
  tone = "normal",
}: {
  label: string;
  value: string;
  tone?: "normal" | "alert";
}) {
  return (
    <div className="rounded-lg border bg-card px-3 py-3">
      <dt className="text-xs text-muted-foreground">
        {label}
      </dt>

      <dd
        className={
          tone === "alert"
            ? "text-lg font-bold text-overdue"
            : "text-lg font-bold"
        }
      >
        {value}
      </dd>
    </div>
  );
}
