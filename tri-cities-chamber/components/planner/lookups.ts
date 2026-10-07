import type {
  ChamberEvent,
  Pillar,
  Sponsor,
  StaffMember,
} from "@/lib/planner/types";

/** Id → entity maps shared by planner components. */
export interface PlannerLookups {
  eventsById: Map<string, ChamberEvent>;
  pillarsById: Map<string, Pillar>;
  sponsorsById: Map<string, Sponsor>;
  staffById: Map<string, StaffMember>;
}

/**
 * Turns a list of items into a Map so we can find an item by its id quickly
 * (e.g. find the event with id "event-5" without looping through all events).
 */
export function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}
