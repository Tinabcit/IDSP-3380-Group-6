import { amountPaid } from "./contracts";
import { isISODateBefore } from "./dates";
import type { ChamberEvent, Contract, ISODate, Sponsor, Task } from "./types";

/** One sponsor line on the event page: the name, and their contract if there is one. */
export interface EventSponsorLine {
  name: string;
  /** The sponsor's contract for this event, or undefined when there is none yet. */
  contract?: Contract;
}

/** Everything the event page shows, worked out from the saved data. */
export interface EventSummary {
  contracts: Contract[];
  /** Total value of the event's contracts. */
  total: number;
  /** How much of that has been paid. */
  received: number;
  /** Paid share from 0 to 100, rounded. 0 when there is no money yet. */
  percent: number;
  /**
   * Every sponsor of the event: those with a contract first (largest first),
   * then names typed on the event form that have no contract yet.
   */
  sponsors: EventSponsorLine[];
  /** Unfinished tasks for the event, earliest due date first. */
  openTasks: Task[];
  /** How many of the open tasks are past their due date. */
  overdue: number;
}

/**
 * Works out the event page: its contracts and money, its sponsors (from
 * contracts, plus names typed on the event that have no contract yet), and its
 * unfinished tasks.
 */
export function summarizeEvent(
  event: ChamberEvent,
  contracts: Contract[],
  tasks: Task[],
  sponsors: Sponsor[],
  today: ISODate
): EventSummary {
  const own = contracts
    .filter((c) => c.eventId === event.id)
    .sort((a, b) => b.amount - a.amount);
  const total = own.reduce((n, c) => n + c.amount, 0);
  const received = own.reduce((n, c) => n + amountPaid(c), 0);

  const sponsorName = (id: string) => sponsors.find((s) => s.id === id)?.name ?? "Unknown sponsor";
  const lines: EventSponsorLine[] = own.map((c) => ({ name: sponsorName(c.sponsorId), contract: c }));
  const typed = event.sponsorNames ?? (event.sponsorName ? [event.sponsorName] : []);
  for (const name of typed) {
    const clean = name.trim();
    if (clean && !lines.some((l) => l.name.toLowerCase() === clean.toLowerCase())) {
      lines.push({ name: clean });
    }
  }

  const openTasks = tasks
    .filter((t) => t.eventId === event.id && !t.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title));

  return {
    contracts: own,
    total,
    received,
    percent: total > 0 ? Math.round((received / total) * 100) : 0,
    sponsors: lines,
    openTasks,
    overdue: openTasks.filter((t) => isISODateBefore(t.dueDate, today)).length,
  };
}
