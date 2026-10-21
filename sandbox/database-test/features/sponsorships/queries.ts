import { prisma } from "./lib/db";
import {
  ACTIVE_EVENT_STATUSES,
  OPEN_AD_STATUSES,
  RANK_ORDER,
} from "./lib/constants";

/** All events with their series and a light summary of sponsorships. */
export function getEvents() {
  return prisma.event.findMany({
    orderBy: { startAt: "asc" },
    include: {
      series: { select: { name: true } },
      sponsorEvents: { select: { status: true, compedTickets: true } },
    },
  });
}

/** Sponsors with their current agreement and open-work counts, pillar first. */
export async function getSponsors() {
  const sponsors = await prisma.sponsor.findMany({
    include: {
      agreements: {
        where: { status: { in: ["active", "pending_renewal"] } },
        orderBy: { endDate: "desc" },
        take: 1,
      },
      sponsorEvents: { select: { status: true } },
      _count: {
        select: {
          adDeliverables: { where: { status: { in: [...OPEN_AD_STATUSES] } } },
        },
      },
    },
  });

  return sponsors.sort(
    (a, b) =>
      (RANK_ORDER[a.rank] ?? 99) - (RANK_ORDER[b.rank] ?? 99) || a.name.localeCompare(b.name),
  );
}

/** Advertising deliverables still owed to sponsors, soonest first. */
export function getOpenAdDeliverables() {
  return prisma.sponsorAdvertising.findMany({
    where: { status: { in: [...OPEN_AD_STATUSES] } },
    orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
    include: {
      sponsor: { select: { name: true } },
      advertising: { select: { name: true } },
      event: { select: { name: true, startAt: true } },
    },
  });
}

/**
 * Comped tickets owed: confirmed sponsorships with tickets on events that
 * haven't finished. (The schema has no "tickets issued" field yet, so a row
 * drops off once its event is completed or cancelled.)
 */
export function getTicketsToFulfill() {
  return prisma.sponsorEvent.findMany({
    where: {
      status: "confirmed",
      compedTickets: { gt: 0 },
      event: { status: { in: [...ACTIVE_EVENT_STATUSES] } },
    },
    orderBy: [{ event: { startAt: "asc" } }, { compedTickets: "desc" }],
    include: {
      sponsor: { select: { name: true, rank: true } },
      event: { select: { id: true, name: true, startAt: true, status: true } },
    },
  });
}
