import { shiftISODate } from "./dates";
import type { ActivityEntry, Contract, ISODate } from "./types";

/**
 * Mock contracts and activity for the frontend MVP. Dates are relative to
 * "today" so reminders and overdue states always show something realistic.
 * Replace with database queries once the backend lands.
 */

/** Makes the demo contracts (with payments and deliverables). Dates are based on today. */
export function buildMockContracts(today: ISODate): Contract[] {
  const d = (offset: number) => shiftISODate(today, offset);
  const createdAt = new Date().toISOString();
  return [
    {
      id: "contract-gala-coastline",
      title: "Gala Presenting Sponsor",
      sponsorId: "sponsor-coastline",
      eventId: "event-gala",
      amount: 15000,
      status: "active",
      signedDate: d(-40),
      fileName: "Coastline-Gala-Presenting-2026.pdf",
      payments: [
        { id: "pay-gc-1", label: "Deposit (50%)", dueDate: d(-30), amount: 7500, paid: true },
        { id: "pay-gc-2", label: "Balance (50%)", dueDate: d(6), amount: 7500, paid: false },
      ],
      deliverables: [
        { id: "del-gc-1", label: "Logo files for program", dueDate: d(-1), done: false },
        { id: "del-gc-2", label: "Speaking slot confirmed", dueDate: d(7), done: false },
      ],
      summary: {
        overview:
          "Coastline Credit Union is the presenting sponsor of the Business Excellence Gala for $15,000, paid in two equal instalments.",
        keyTerms: [
          "Logo on all gala print and digital material",
          "Five minute speaking slot during the program",
          "Two tables of ten reserved at the front",
        ],
        watchouts: [
          "Vector logo files are required before the printer deadline",
          "Balance is due 3 days before the event",
        ],
      },
      createdAt,
    },
    {
      id: "contract-gala-harbour",
      title: "Gala Table Sponsor",
      sponsorId: "sponsor-harbour",
      eventId: "event-gala",
      amount: 5000,
      status: "active",
      signedDate: d(-20),
      fileName: "Harbour-Gala-Table.pdf",
      payments: [
        { id: "pay-gh-1", label: "Full payment", dueDate: d(0), amount: 5000, paid: false },
      ],
      deliverables: [
        { id: "del-gh-1", label: "Confirm guest list for table", dueDate: d(5), done: false },
      ],
      summary: {
        overview: "Harbour Insurance sponsors one table at the gala for $5,000, due in full.",
        keyTerms: ["Table of ten", "Name on table signage", "Logo in program"],
        watchouts: ["Guest names needed 4 days before the event"],
      },
      createdAt,
    },
    {
      id: "contract-golf-ridgeway",
      title: "Golf Classic Title Sponsor",
      sponsorId: "sponsor-ridgeway",
      eventId: "event-golf",
      amount: 12000,
      status: "active",
      signedDate: d(-15),
      fileName: "Ridgeway-Golf-Title.pdf",
      payments: [
        { id: "pay-gr-1", label: "First instalment (50%)", dueDate: d(-10), amount: 6000, paid: true },
        { id: "pay-gr-2", label: "Second instalment (50%)", dueDate: d(4), amount: 6000, paid: false },
      ],
      deliverables: [
        { id: "del-gr-1", label: "Hole sponsor signs to printer", dueDate: d(14), done: false },
      ],
      summary: {
        overview:
          "Ridgeway Builders is title sponsor of the Charity Golf Classic for $12,000 in two instalments.",
        keyTerms: [
          "Naming rights: Ridgeway Builders Golf Classic",
          "One foursome",
          "Hole sponsor sign",
        ],
        watchouts: ["Second instalment is due 30 days before the event"],
      },
      createdAt,
    },
    {
      id: "contract-summit-coastline",
      title: "Summit Education Partner",
      sponsorId: "sponsor-coastline",
      eventId: "event-summit",
      amount: 6000,
      status: "completed",
      signedDate: d(-70),
      fileName: "Coastline-Summit-2026.pdf",
      payments: [
        { id: "pay-sc-1", label: "Full payment", dueDate: d(-45), amount: 6000, paid: true },
      ],
      deliverables: [
        { id: "del-sc-1", label: "Post-event thank-you", dueDate: d(-3), done: true },
      ],
      summary: {
        overview:
          "Coastline Credit Union was the education partner for the Small Business Summit ($6,000).",
        keyTerms: ["Logo on summit signage", "Session naming: Financing Your Growth"],
        watchouts: [],
      },
      createdAt,
    },
    {
      id: "contract-breakfast-northshore",
      title: "Breakfast Sponsor",
      sponsorId: "sponsor-northshore",
      eventId: "event-breakfast",
      amount: 1500,
      status: "active",
      signedDate: d(-12),
      payments: [
        { id: "pay-bn-1", label: "Full payment", dueDate: d(-5), amount: 1500, paid: true },
      ],
      deliverables: [
        { id: "del-bn-1", label: "Sponsor recognition slide", dueDate: d(0), done: true },
      ],
      summary: {
        overview: "North Shore Dental sponsors the Networking Breakfast for $1,500.",
        keyTerms: ["Recognition slide", "Two tickets"],
        watchouts: [],
      },
      createdAt,
    },
    {
      id: "contract-gala-pacific",
      title: "Gala In-Kind Printing",
      sponsorId: "sponsor-pacific",
      eventId: "event-gala",
      amount: 3000,
      status: "draft",
      payments: [],
      deliverables: [
        { id: "del-gp-1", label: "Signage proof approval", dueDate: d(3), done: false },
      ],
      notes: "In-kind. Waiting on a signed copy from Pacific Print.",
      createdAt,
    },
  ];
}

/** Makes the demo history entries, dated a few hours before now. */
export function buildMockActivity(now = new Date()): ActivityEntry[] {
  const ago = (hours: number) =>
    new Date(now.getTime() - hours * 3_600_000).toISOString();
  return [
    {
      id: "act-1",
      at: ago(2),
      userId: "staff-maria",
      message: "Marked deposit as paid on Gala Presenting Sponsor",
      contractId: "contract-gala-coastline",
    },
    {
      id: "act-2",
      at: ago(26),
      userId: "staff-priya",
      message: "Added contract Gala In-Kind Printing",
      contractId: "contract-gala-pacific",
    },
    {
      id: "act-3",
      at: ago(50),
      userId: "staff-daniel",
      message: "Added contract Golf Classic Title Sponsor",
      contractId: "contract-golf-ridgeway",
    },
  ];
}
