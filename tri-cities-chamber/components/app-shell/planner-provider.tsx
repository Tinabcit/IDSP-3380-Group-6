"use client";

import { createContext, useContext, useMemo } from "react";

import { usePlannerStore, type PlannerStore } from "@/hooks/use-planner-store";
import { useToday } from "@/hooks/use-today";
import { indexById, type PlannerLookups } from "@/components/planner/lookups";
import type { ISODate, Pillar, StaffMember } from "@/lib/planner/types";

/**
 * Everything a page can use: the data, the functions that change it
 * (add task, etc.), today's date, the pillars and staff lists, who is signed in,
 * and the lookup tables (see lookups.ts).
 */
export interface PlannerData extends PlannerStore {
  today: ISODate;
  pillars: Pillar[];
  staff: StaffMember[];
  currentUser: StaffMember;
  lookups: PlannerLookups;
}

/**
 * A shared "box" React uses to hand the data to any component that asks for it.
 * It is empty (null) until the data has loaded.
 */
const PlannerContext = createContext<PlannerData | null>(null);

/** A database problem to show the person, plus a way to clear it once shown. */
interface SaveErrorState {
  saveError: string | null;
  /** Set (and kept) when the first load failed. */
  loadError: string | null;
  clearSaveError: () => void;
}

/**
 * Shares database errors separately from the data, because a failed first
 * load leaves the data box empty (null) but the error still has to be shown.
 */
const SaveErrorContext = createContext<SaveErrorState>({
  saveError: null,
  loadError: null,
  clearSaveError: () => {},
});

/**
 * Loads the app data ONCE and shares it with every page, so the calendar,
 * contracts, events and partners pages all show the same information.
 * The value is null until the data has loaded from the database and today's date is known.
 */
export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const store = usePlannerStore();
  const today = useToday();

  const lookups: PlannerLookups = useMemo(
    () => ({
      eventsById: indexById(store.events),
      pillarsById: indexById(store.pillars),
      sponsorsById: indexById(store.sponsors),
      staffById: indexById(store.staff),
    }),
    [store.events, store.pillars, store.sponsors, store.staff]
  );

  const value = useMemo<PlannerData | null>(() => {
    if (!store.isReady || !today) return null;
    return {
      ...store,
      today,
      pillars: store.pillars,
      staff: store.staff,
      // The database always returns the signed-in person, so the fallbacks are only a safety net.
      currentUser: lookups.staffById.get(store.currentUserId) ??
        store.staff[0] ?? { id: store.currentUserId, name: "Staff member", initials: "S" },
      lookups,
    };
  }, [store, today, lookups]);

  const { saveError, loadError, clearSaveError } = store;
  const errorState = useMemo(
    () => ({ saveError, loadError, clearSaveError }),
    [saveError, loadError, clearSaveError]
  );

  return (
    <SaveErrorContext.Provider value={errorState}>
      <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
    </SaveErrorContext.Provider>
  );
}

/** Gets the latest database error (load or save), if any. Works before the data has loaded. */
export function useSaveError(): SaveErrorState {
  return useContext(SaveErrorContext);
}

/**
 * Gets the shared data, but returns null if it is not loaded yet.
 * Used by the header/footer, which show up before the data is ready.
 */
export function useOptionalPlannerData(): PlannerData | null {
  return useContext(PlannerContext);
}

/**
 * Gets the shared data. Throws an error if it is not loaded yet.
 * Pages use this; DataGate makes sure they only show once data is ready.
 */
export function usePlannerData(): PlannerData {
  const data = useContext(PlannerContext);
  if (!data) throw new Error("usePlannerData must be used inside a ready PlannerProvider");
  return data;
}

/**
 * Wraps the part of a page that needs data. While the data is loading it shows
 * "Loading" (or the error, if loading failed); once ready it shows its children. The page itself still shows
 * right away - only this inside part waits.
 */
export function DataGate({ children }: { children: React.ReactNode }) {
  const data = useContext(PlannerContext);
  const { loadError } = useContext(SaveErrorContext);
  if (!data) {
    return (
      <div role="status" className="grid min-h-[50dvh] place-items-center text-sm text-muted-foreground">
        {loadError ?? "Loading"}
      </div>
    );
  }
  return <>{children}</>;
}
