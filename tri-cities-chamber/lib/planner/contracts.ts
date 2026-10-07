import { isISODateBefore } from "./dates";
import type {
  ChamberEvent,
  Contract,
  ContractGroupBy,
  ContractInput,
  ContractSortBy,
  ContractSummary,
  ISODate,
  Pillar,
  PlannerFilters,
  Sponsor,
} from "./types";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function amountPaid(contract: Contract): number {
  return contract.payments
    .filter((p) => p.paid)
    .reduce((sum, p) => sum + p.amount, 0);
}

/** Earliest unpaid payment or unfinished deliverable, or null if nothing is outstanding. */
export function nextDueDate(contract: Contract): ISODate | null {
  const dates = [
    ...contract.payments.filter((p) => !p.paid).map((p) => p.dueDate),
    ...contract.deliverables.filter((d) => !d.done).map((d) => d.dueDate),
  ].sort();
  return dates[0] ?? null;
}

export function isContractOverdue(contract: Contract, today: ISODate): boolean {
  const next = nextDueDate(contract);
  return (
    contract.status !== "completed" &&
    next !== null &&
    isISODateBefore(next, today)
  );
}

export interface ContractLookups {
  eventsById: Map<string, ChamberEvent>;
  pillarsById: Map<string, Pillar>;
  sponsorsById: Map<string, Sponsor>;
}

export function filterContracts(
  contracts: Contract[],
  filters: PlannerFilters,
  query: string,
  lookups: ContractLookups
): Contract[] {
  const q = query.trim().toLowerCase();
  return contracts.filter((c) => {
    const event = c.eventId ? lookups.eventsById.get(c.eventId) : undefined;
    const sponsor = lookups.sponsorsById.get(c.sponsorId);
    if (filters.signatureOnly && !event?.isSignature) return false;
    if (filters.pillarId && event?.pillarId !== filters.pillarId) return false;
    if (filters.sponsorId && c.sponsorId !== filters.sponsorId) return false;
    if (q) {
      const haystack = [c.title, sponsor?.name, event?.name, c.fileName, c.notes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function sortContracts(
  contracts: Contract[],
  sortBy: ContractSortBy,
  lookups: ContractLookups
): Contract[] {
  const partner = (c: Contract) =>
    lookups.sponsorsById.get(c.sponsorId)?.name ?? "";
  return [...contracts].sort((a, b) => {
    switch (sortBy) {
      case "amount":
        return b.amount - a.amount;
      case "title":
        return a.title.localeCompare(b.title);
      case "partner":
        return (
          partner(a).localeCompare(partner(b)) || a.title.localeCompare(b.title)
        );
      case "nextDue": {
        const da = nextDueDate(a);
        const db = nextDueDate(b);
        if (da === db) return a.title.localeCompare(b.title);
        if (da === null) return 1;
        if (db === null) return -1;
        return da.localeCompare(db);
      }
    }
  });
}

export interface ContractGroup {
  key: string;
  label: string;
  contracts: Contract[];
}

export function groupContracts(
  contracts: Contract[],
  groupBy: ContractGroupBy,
  lookups: ContractLookups
): ContractGroup[] {
  if (groupBy === "none") return [{ key: "all", label: "", contracts }];

  const groups = new Map<string, ContractGroup>();
  for (const c of contracts) {
    const event = c.eventId ? lookups.eventsById.get(c.eventId) : undefined;
    let key: string;
    let label: string;
    if (groupBy === "event") {
      key = event?.id ?? "none";
      label = event?.name ?? "Not tied to an event";
    } else if (groupBy === "pillar") {
      const pillar = event ? lookups.pillarsById.get(event.pillarId) : undefined;
      key = pillar?.id ?? "none";
      label = pillar?.name ?? "No pillar";
    } else {
      const sponsor = lookups.sponsorsById.get(c.sponsorId);
      key = sponsor?.id ?? "none";
      label = sponsor?.name ?? "Unknown partner";
    }
    const group = groups.get(key) ?? { key, label, contracts: [] };
    group.contracts.push(c);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Stand-in for the contract reader. A real build would send the uploaded file
 * to an LLM; here we compose a plain-language summary from the entered fields.
 */
export function buildDemoSummary(
  input: Pick<ContractInput, "title" | "amount" | "payments" | "deliverables">,
  sponsorName: string,
  eventName?: string
): ContractSummary {
  const where = eventName ? ` for ${eventName}` : "";
  const count = input.payments.length;
  const schedule =
    count === 0
      ? "with no payment schedule recorded yet"
      : `payable in ${count} instalment${count === 1 ? "" : "s"}`;
  return {
    overview: `${sponsorName} has agreed to "${input.title}"${where}, worth ${formatCurrency(input.amount)}, ${schedule}.`,
    keyTerms: [
      ...input.payments.map(
        (p) => `${p.label}: ${formatCurrency(p.amount)} due ${p.dueDate}`
      ),
      ...input.deliverables.map((d) => `${d.label} by ${d.dueDate}`),
    ],
    watchouts: count === 0 ? ["No payment schedule recorded yet"] : [],
  };
}

/**
 * Pretend extraction for the upload flow. Guesses the partner and event from
 * the file name and proposes a typical payment schedule, so staff only have to
 * confirm. Dates are passed in already shifted from today.
 */
export function simulateExtraction(
  fileName: string,
  sponsors: Sponsor[],
  events: ChamberEvent[],
  dates: { today: ISODate; deposit: ISODate; balance: ISODate }
): Partial<ContractInput> {
  const lower = fileName.toLowerCase();
  const sponsor = sponsors.find((s) =>
    lower.includes(s.name.split(" ")[0].toLowerCase())
  );
  const event = events.find((e) =>
    lower.includes(e.name.split(" ")[0].toLowerCase())
  );
  return {
    title: fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
    sponsorId: sponsor?.id,
    eventId: event?.id,
    amount: 5000,
    signedDate: dates.today,
    payments: [
      { id: "x1", label: "Deposit (50%)", dueDate: dates.deposit, amount: 2500, paid: false },
      { id: "x2", label: "Balance (50%)", dueDate: dates.balance, amount: 2500, paid: false },
    ],
  };
}
