"use client";

import { createContext, useContext, useMemo } from "react";

import { usePlannerStore, type PlannerStore } from "@/hooks/use-planner-store";
import { useToday } from "@/hooks/use-today";
import { indexById, type PlannerLookups } from "@/components/planner/lookups";
import { PILLARS, STAFF } from "@/lib/planner/mock-data";
import type { ISODate, Pillar, StaffMember } from "@/lib/planner/types";

export interface PlannerData extends PlannerStore {
  today: ISODate;
  pillars: Pillar[];
  staff: StaffMember[];
  currentUser: StaffMember;
  lookups: PlannerLookups;
}

const PlannerContext = createContext<PlannerData | null>(null);

/**
 * One store for the whole app, so the calendar, contracts, events and partners
 * pages all see the same data without refetching when you navigate.
 * `null` until the browser has loaded saved data and today's date.
 */
export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const store = usePlannerStore();
  const today = useToday();

  const lookups: PlannerLookups = useMemo(
    () => ({
      eventsById: indexById(store.events),
      pillarsById: indexById(PILLARS),
      sponsorsById: indexById(store.sponsors),
      staffById: indexById(STAFF),
    }),
    [store.events, store.sponsors]
  );

  const value = useMemo<PlannerData | null>(() => {
    if (!store.isReady || !today) return null;
    return {
      ...store,
      today,
      pillars: PILLARS,
      staff: STAFF,
      currentUser: lookups.staffById.get(store.currentUserId) ?? STAFF[0],
      lookups,
    };
  }, [store, today, lookups]);

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

/** For the shell, which renders before data is ready. */
export function useOptionalPlannerData(): PlannerData | null {
  return useContext(PlannerContext);
}

/** For pages. The shell only renders them once data is ready. */
export function usePlannerData(): PlannerData {
  const data = useContext(PlannerContext);
  if (!data) throw new Error("usePlannerData must be used inside a ready PlannerProvider");
  return data;
}

/**
 * Wraps a page's data-dependent UI. The page segment itself always renders
 * (so it is part of the static shell); only this content waits for the
 * browser to load saved data and today's date.
 */
export function DataGate({ children }: { children: React.ReactNode }) {
  const data = useContext(PlannerContext);
  if (!data) {
    return (
      <div role="status" className="grid min-h-[50dvh] place-items-center text-sm text-muted-foreground">
        Loading
      </div>
    );
  }
  return <>{children}</>;
}
