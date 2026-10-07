import { shiftISODate } from "./dates";
import type {
  ChamberEvent,
  ISODate,
  Pillar,
  Sponsor,
  StaffMember,
  Task,
} from "./types";

/**
 * Mock data for the frontend MVP. Event and task dates are generated
 * relative to "today" so the calendar always has something to show.
 * Replace with Supabase queries once the backend lands.
 */

export const PILLARS: Pillar[] = [
  { id: "pillar-advocacy", name: "Advocacy" },
  { id: "pillar-networking", name: "Networking" },
  { id: "pillar-education", name: "Education" },
  { id: "pillar-community", name: "Community" },
];

export const SPONSORS: Sponsor[] = [
  {
    id: "sponsor-coastline",
    name: "Coastline Credit Union",
    contactName: "Alicia Tran",
    contactEmail: "alicia@coastlinecu.example",
    contactPhone: "604-555-0142",
  },
  {
    id: "sponsor-harbour",
    name: "Harbour Insurance",
    contactName: "Greg Mahler",
    contactEmail: "greg@harbourins.example",
    contactPhone: "604-555-0178",
  },
  {
    id: "sponsor-ridgeway",
    name: "Ridgeway Builders",
    contactName: "Samira Qureshi",
    contactEmail: "samira@ridgeway.example",
    contactPhone: "604-555-0109",
  },
  {
    id: "sponsor-northshore",
    name: "North Shore Dental",
    contactName: "Dr. Paul Lee",
    contactEmail: "office@northshoredental.example",
  },
  {
    id: "sponsor-pacific",
    name: "Pacific Print Co.",
    contactName: "Jenna Wirth",
    contactEmail: "jenna@pacificprint.example",
    contactPhone: "604-555-0166",
  },
];

export const STAFF: StaffMember[] = [
  { id: "staff-maria", name: "Maria Chen", initials: "MC" },
  { id: "staff-daniel", name: "Daniel Okafor", initials: "DO" },
  { id: "staff-priya", name: "Priya Sandhu", initials: "PS" },
  { id: "staff-intern", name: "Intern", initials: "IN" },
];

export function buildMockEvents(today: ISODate): ChamberEvent[] {
  const d = (offset: number) => shiftISODate(today, offset);
  return [
    {
      id: "event-gala",
      name: "Business Excellence Gala",
      startDate: d(9),
      endDate: d(9),
      pillarId: "pillar-community",
      isSignature: true,
      location: "Civic Centre Ballroom",
    },
    {
      id: "event-golf",
      name: "Charity Golf Classic",
      startDate: d(24),
      endDate: d(24),
      pillarId: "pillar-networking",
      isSignature: true,
      location: "Westwood Plateau",
    },
    {
      id: "event-summit",
      name: "Small Business Summit",
      startDate: d(-6),
      endDate: d(-5),
      pillarId: "pillar-education",
      isSignature: true,
      location: "Evergreen Cultural Centre",
    },
    {
      id: "event-breakfast",
      name: "Networking Breakfast",
      startDate: d(2),
      endDate: d(2),
      pillarId: "pillar-networking",
      isSignature: false,
    },
    {
      id: "event-policy",
      name: "Municipal Policy Roundtable",
      startDate: d(15),
      endDate: d(15),
      pillarId: "pillar-advocacy",
      isSignature: false,
    },
    {
      id: "event-workshop",
      name: "Digital Marketing Workshop",
      startDate: d(5),
      endDate: d(5),
      pillarId: "pillar-education",
      isSignature: false,
    },
    {
      id: "event-mixer",
      name: "After Hours Mixer",
      startDate: d(-12),
      endDate: d(-12),
      pillarId: "pillar-networking",
      isSignature: false,
    },
  ];
}

export function buildMockTasks(today: ISODate): Task[] {
  const d = (offset: number) => shiftISODate(today, offset);
  const createdAt = new Date().toISOString();
  return [
    {
      id: "task-1",
      title: "Collect logo files for gala program",
      dueDate: d(-1),
      completed: false,
      assigneeId: "staff-priya",
      eventId: "event-gala",
      sponsorId: "sponsor-coastline",
      contractId: "contract-gala-coastline",
      notes: "Need vector (SVG or EPS). Printer deadline is firm.",
      createdAt,
    },
    {
      id: "task-2",
      title: "Confirm table count with sponsor",
      dueDate: d(0),
      completed: false,
      assigneeId: "staff-maria",
      eventId: "event-gala",
      sponsorId: "sponsor-harbour",
      createdAt,
    },
    {
      id: "task-3",
      title: "Send breakfast sponsor recognition slide",
      dueDate: d(0),
      completed: true,
      assigneeId: "staff-intern",
      eventId: "event-breakfast",
      sponsorId: "sponsor-northshore",
      createdAt,
    },
    {
      id: "task-4",
      title: "Signage proof approval",
      dueDate: d(3),
      completed: false,
      assigneeId: "staff-daniel",
      eventId: "event-gala",
      sponsorId: "sponsor-pacific",
      createdAt,
    },
    {
      id: "task-5",
      title: "Invoice second sponsorship instalment",
      dueDate: d(4),
      completed: false,
      assigneeId: "staff-maria",
      sponsorId: "sponsor-ridgeway",
      contractId: "contract-golf-ridgeway",
      notes: "Per contract, 50% due 30 days before golf classic.",
      createdAt,
    },
    {
      id: "task-6",
      title: "Hole sponsor sign list to printer",
      dueDate: d(14),
      completed: false,
      assigneeId: "staff-priya",
      eventId: "event-golf",
      sponsorId: "sponsor-ridgeway",
      createdAt,
    },
    {
      id: "task-7",
      title: "Post-summit thank-you to sponsors",
      dueDate: d(-3),
      completed: true,
      assigneeId: "staff-daniel",
      eventId: "event-summit",
      sponsorId: "sponsor-coastline",
      createdAt,
    },
    {
      id: "task-8",
      title: "Book workshop speaker AV",
      dueDate: d(-2),
      completed: false,
      assigneeId: "staff-intern",
      eventId: "event-workshop",
      createdAt,
    },
    {
      id: "task-9",
      title: "Draft roundtable briefing note",
      dueDate: d(11),
      completed: false,
      assigneeId: "staff-daniel",
      eventId: "event-policy",
      createdAt,
    },
  ];
}
