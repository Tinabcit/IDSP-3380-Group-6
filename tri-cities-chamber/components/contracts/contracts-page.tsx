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

/**
 * The contracts list page (/contracts). It remembers the search text, filters,
 * grouping and sorting. The contracts go through three steps - filter, sort,
 * group (functions in lib/planner/contracts.ts) - and are then shown as cards.
 * It also shows totals at the top and recent changes at the bottom.
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
    return groupContracts(sortContracts(filtered, sortBy, lookups), groupBy, lookups);
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

  return (
    <div className="grid gap-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight">Contracts</h1>
          <p className="text-sm text-muted-foreground">
            Every sponsorship agreement, with what is owed and when.
          </p>
        </div>
        <Button asChild>
          <Link href="/contracts/new">
            <Plus />
            <span>
              <span className="sm:hidden">New</span>
              <span className="hidden sm:inline">New contract</span>
            </span>
          </Link>
        </Button>
      </header>

      <dl className="grid grid-cols-3 gap-3">
        <Stat label="Total value" value={formatCurrency(totals.value)} />
        <Stat label="Received" value={formatCurrency(totals.paid)} />
        <Stat
          label="Need attention"
          value={String(totals.attention)}
          tone={totals.attention > 0 ? "alert" : "normal"}
        />
      </dl>

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
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as ContractGroupBy)}>
            <SelectTrigger aria-label="Group contracts" className="h-9 w-auto gap-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(GROUP_LABELS) as ContractGroupBy[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {GROUP_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as ContractSortBy)}>
            <SelectTrigger aria-label="Sort contracts" className="h-9 w-auto gap-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as ContractSortBy[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {shown} of {contracts.length} contracts.
      </p>

      {shown === 0 ? (
        <div className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No contracts match. Try clearing the search or filters.
        </div>
      ) : (
        <div className="grid gap-6">
          {groups.map((group) => (
            <section key={group.key} aria-label={group.label || "All contracts"} className="grid gap-2">
              {group.label && (
                <h2 className="flex items-baseline justify-between text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>{group.label}</span>
                  <span className="font-normal normal-case tracking-normal">
                    {formatCurrency(group.contracts.reduce((n, c) => n + c.amount, 0))}
                  </span>
                </h2>
              )}
              <ul className="grid gap-2">
                {group.contracts.map((c) => (
                  <ContractCard key={c.id} contract={c} today={today} lookups={lookups} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <section aria-labelledby="activity-heading" className="grid gap-3 border-t pt-6">
        <h2 id="activity-heading" className="text-base font-semibold">
          Recent changes
        </h2>
        <ActivityList entries={data.activity.slice(0, 6)} lookups={lookups} />
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
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={tone === "alert" ? "text-lg font-bold text-overdue" : "text-lg font-bold"}>
        {value}
      </dd>
    </div>
  );
}
