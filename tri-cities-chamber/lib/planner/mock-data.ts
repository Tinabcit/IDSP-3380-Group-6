import { shiftISODate } from "./dates";
import type { ChamberEvent, ISODate } from "./types";

/**
 * Sample events used by the unit tests only (lib/planner/events.test.ts).
 * The app itself no longer uses mock data: everything comes from the Supabase
 * database (see lib/db/). Do not import this file from app code.
 */

/** Makes the demo events. Dates are based on today so the calendar always has something to show. */
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
      category: "fundraiser",
      startTime: "18:00",
      endTime: "22:00",
      description: "A black-tie evening honouring local business leaders.",
      location: "Civic Centre Ballroom",
    },
    {
      id: "event-golf",
      name: "Charity Golf Classic",
      startDate: d(24),
      endDate: d(24),
      pillarId: "pillar-networking",
      isSignature: true,
      category: "fundraiser",
      startTime: "09:00",
      endTime: "16:00",
      location: "Westwood Plateau",
    },
    {
      id: "event-summit",
      name: "Small Business Summit",
      startDate: d(-6),
      endDate: d(-5),
      pillarId: "pillar-education",
      isSignature: true,
      category: "workshop",
      startTime: "09:00",
      endTime: "17:00",
      location: "Evergreen Cultural Centre",
    },
    {
      id: "event-breakfast",
      name: "Networking Breakfast",
      startDate: d(2),
      endDate: d(2),
      pillarId: "pillar-networking",
      isSignature: false,
      category: "networking",
      startTime: "07:30",
      endTime: "09:00",
    },
    {
      id: "event-policy",
      name: "Municipal Policy Roundtable",
      startDate: d(15),
      endDate: d(15),
      pillarId: "pillar-advocacy",
      isSignature: false,
      category: "meeting",
      startTime: "12:00",
      endTime: "13:30",
    },
    {
      id: "event-workshop",
      name: "Digital Marketing Workshop",
      startDate: d(5),
      endDate: d(5),
      pillarId: "pillar-education",
      isSignature: false,
      category: "workshop",
      startTime: "13:00",
      endTime: "15:00",
    },
    {
      id: "event-mixer",
      name: "After Hours Mixer",
      startDate: d(-12),
      endDate: d(-12),
      pillarId: "pillar-networking",
      isSignature: false,
      category: "networking",
      startTime: "17:00",
      endTime: "19:00",
    },
  ];
}
