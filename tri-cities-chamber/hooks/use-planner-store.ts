"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  createContractAction,
  createEventAction,
  createSponsorAction,
  createTaskAction,
  deleteContractAction,
  deleteEventAction,
  deleteTaskAction,
  loadPlannerData,
  setContractItemDoneAction,
  setContractStatusAction,
  setTaskCompletedAction,
  updateEventAction,
  updateSponsorAction,
  updateTaskAction,
} from "@/lib/db/actions";
import type { PlannerSnapshot } from "@/lib/db/planner-repo";
import { isUuid, newId } from "@/lib/planner/ids";
import type {
  ActivityEntry,
  ChamberEvent,
  Contract,
  ContractInput,
  EventInput,
  ISODate,
  Pillar,
  Sponsor,
  SponsorInput,
  StaffMember,
  Task,
  TaskInput,
} from "@/lib/planner/types";

import { reducer, type Action, type PlannerState } from "./planner-reducer";

// The reducer used to live in this file; re-exported so older imports keep working.
export { reducer };
export type { Action, PlannerState };

/** The browser remembers who was picked in "Signed in as" under this name. */
const CURRENT_USER_KEY = "partner-calendar:current-user";

/** Reads who was last picked in "Signed in as" (null if nothing saved or storage is blocked). */
function readSavedUserId(): string | null {
  try {
    return window.localStorage.getItem(CURRENT_USER_KEY);
  } catch {
    return null;
  }
}

/** Remembers who was picked in "Signed in as". Failing to save is ignored. */
function writeSavedUserId(id: string) {
  try {
    window.localStorage.setItem(CURRENT_USER_KEY, id);
  } catch {
    // Storage blocked (private mode). The choice just will not be remembered.
  }
}

/**
 * The history line an action just added, so the same line can be saved to
 * the database. Undefined when the action did not add one.
 */
function newEntry(next: PlannerState, logId: string): ActivityEntry | undefined {
  const first = next.activity[0];
  return first && first.id === logId ? first : undefined;
}

/** Gives every sponsor to do a UUID (the default list uses fixed ids like "todo-logo"). */
function withTodoIds<T extends SponsorInput>(input: T): T {
  if (!input.todos) return input;
  return { ...input, todos: input.todos.map((t) => (isUuid(t.id) ? t : { ...t, id: newId() })) };
}

/** Extra settings for creating a contract. */
export interface NewContractOptions {
  /** Who the generated reminder tasks are assigned to. */
  assigneeId: string;
}

/** What the store holds before the database has answered. */
const INITIAL_STATE: PlannerState = {
  status: "loading",
  events: [],
  tasks: [],
  sponsors: [],
  contracts: [],
  activity: [],
  currentUserId: "",
};

/**
 * The one hook that holds all the app data. It is called ONCE, in
 * PlannerProvider; other components get the data with usePlannerData().
 * It gives back the data lists plus functions to change them (add, update,
 * toggle, delete, ...).
 *
 * Data comes from the Supabase database through the server actions in
 * lib/db/actions.ts. Every change is shown straight away (the reducer above
 * runs first) and then saved to the database. If a save fails, the store
 * reloads everything from the database so the screen matches what was really
 * saved, and saveError is set so the app can tell the person. loadError stays
 * set if the first load failed, so the pages can say so instead of "Loading".
 */
export function usePlannerStore() {
  const [state, setState] = useState<PlannerState>(INITIAL_STATE);
  // The latest state, readable straight away (state itself only updates on the next render).
  const stateRef = useRef<PlannerState>(INITIAL_STATE);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  /** Runs an action through the reducer, shows the result, and returns the state before and after. */
  const apply = useCallback((action: Action) => {
    const prev = stateRef.current;
    const next = reducer(prev, action);
    stateRef.current = next;
    setState(next);
    return { prev, next };
  }, []);

  /** Puts a freshly loaded database snapshot into the store. Null means nobody is signed in. */
  const applySnapshot = useCallback(
    (snapshot: PlannerSnapshot | null) => {
      if (!snapshot) return; // Nobody signed in (landing page).
      setPillars(snapshot.pillars);
      setStaff(snapshot.staff);
      // Keep the person picked in "Signed in as" if they still exist, otherwise use who signed in.
      const saved = readSavedUserId();
      const keepSaved = saved !== null && snapshot.staff.some((s) => s.id === saved);
      apply({
        type: "hydrate",
        data: snapshot.data,
        currentUserId: keepSaved ? saved : snapshot.currentProfileId,
      });
    },
    [apply]
  );

  /** Loads everything from the database and replaces what the store holds. */
  const load = useCallback(() => loadPlannerData().then(applySnapshot), [applySnapshot]);

  // Load once, on the client.
  useEffect(() => {
    loadPlannerData()
      .then(applySnapshot)
      .catch((error) => {
        console.error("Could not load data from the database", error);
        const message = "Could not load data from the database. Check the connection and refresh.";
        setLoadError(message);
        setSaveError(message);
      });
  }, [applySnapshot]);

  /**
   * Waits for a database save in the background. If it fails, tells the person
   * and reloads, so the screen does not show a change that was not saved.
   */
  const save = useCallback(
    (write: Promise<unknown>) => {
      write.catch((error) => {
        console.error("Could not save to the database", error);
        setSaveError("Your last change could not be saved. The page now shows what is in the database.");
        load().catch((reloadError) => console.error("Could not reload data", reloadError));
      });
    },
    [load]
  );

  /** Clears the save error once it has been shown. */
  const clearSaveError = useCallback(() => setSaveError(null), []);

  /** Changes who is signed in (used in the history and as the default assignee). */
  const setCurrentUser = useCallback(
    (id: string) => {
      writeSavedUserId(id);
      apply({ type: "setUser", id });
    },
    [apply]
  );

  /** Creates a new task (not done yet) from the form values and records it in the history. */
  const addTask = useCallback(
    (input: TaskInput) => {
      const logId = newId();
      const task: Task = { ...input, id: newId(), completed: false, createdAt: new Date().toISOString() };
      const { next } = apply({ type: "addTask", task, logId });
      save(createTaskAction(task, newEntry(next, logId)));
    },
    [apply, save]
  );

  /** Updates the fields of an existing task. */
  const updateTask = useCallback(
    (id: string, input: TaskInput) => {
      const logId = newId();
      const { prev, next } = apply({ type: "updateTask", id, input, logId });
      if (prev === next) return;
      save(updateTaskAction(id, input, newEntry(next, logId)));
    },
    [apply, save]
  );

  /** Ticks or unticks a task (and its matching payment/deliverable, if it has one). */
  const toggleTask = useCallback(
    (id: string) => {
      const logId = newId();
      const { prev, next } = apply({ type: "toggleTask", id, logId });
      const task = next.tasks.find((t) => t.id === id);
      if (prev === next || !task) return;
      save(setTaskCompletedAction(id, task.completed, newEntry(next, logId)));
    },
    [apply, save]
  );

  /** Deletes a task. The contract it came from is not changed. */
  const deleteTask = useCallback(
    (id: string) => {
      const logId = newId();
      const { prev, next } = apply({ type: "deleteTask", id, logId });
      if (prev === next) return;
      save(deleteTaskAction(id, newEntry(next, logId)));
    },
    [apply, save]
  );

  /** Adds an event and returns its new id. */
  const addEvent = useCallback(
    (input: EventInput): string => {
      const id = newId();
      const logId = newId();
      const event: ChamberEvent = { ...input, id };
      const { next } = apply({ type: "addEvent", event, logId });
      save(createEventAction(event, newEntry(next, logId)));
      return id;
    },
    [apply, save]
  );

  /** Replaces the fields of an existing event. */
  const updateEvent = useCallback(
    (id: string, input: EventInput) => {
      const logId = newId();
      const { prev, next } = apply({ type: "updateEvent", id, input, logId });
      if (prev === next) return;
      save(updateEventAction(id, input, newEntry(next, logId)));
    },
    [apply, save]
  );

  /** Deletes an event. Its tasks and contracts are kept but no longer linked to it. */
  const deleteEvent = useCallback(
    (id: string) => {
      const logId = newId();
      const { prev, next } = apply({ type: "deleteEvent", id, logId });
      if (prev === next) return;
      save(deleteEventAction(id, newEntry(next, logId)));
    },
    [apply, save]
  );

  /** Adds a partner (sponsor) and returns its new id. */
  const addSponsor = useCallback(
    (input: SponsorInput): string => {
      const id = newId();
      const sponsor: Sponsor = { ...withTodoIds(input), id };
      apply({ type: "addSponsor", sponsor });
      save(createSponsorAction(sponsor));
      return id;
    },
    [apply, save]
  );

  /** Replaces the fields of an existing sponsor. */
  const updateSponsor = useCallback(
    (id: string, input: SponsorInput) => {
      const logId = newId();
      const fixed = withTodoIds(input);
      const { prev, next } = apply({ type: "updateSponsor", id, input: fixed, logId });
      if (prev === next) return;
      save(updateSponsorAction(id, fixed, newEntry(next, logId)));
    },
    [apply, save]
  );

  /**
   * Saves the contract and creates a reminder task for every unpaid payment
   * and unfinished deliverable, so entry is one step instead of two.
   */
  const addContract = useCallback(
    (raw: ContractInput, { assigneeId }: NewContractOptions): string => {
      const id = newId();
      const now = new Date().toISOString();
      // Payment and deliverable rows need UUIDs too (the form may have made other ids).
      const input: ContractInput = {
        ...raw,
        payments: raw.payments.map((p) => (isUuid(p.id) ? p : { ...p, id: newId() })),
        deliverables: raw.deliverables.map((d) => (isUuid(d.id) ? d : { ...d, id: newId() })),
      };
      const base = { assigneeId, eventId: input.eventId, sponsorId: input.sponsorId, contractId: id };
      const tasks: Task[] = [
        ...input.payments
          .filter((p) => !p.paid)
          .map((p) => ({
            ...base,
            id: newId(),
            title: `${input.title}: ${p.label}`,
            dueDate: p.dueDate,
            completed: false,
            contractItemId: p.id,
            createdAt: now,
          })),
        ...input.deliverables
          .filter((d) => !d.done)
          .map((d) => ({
            ...base,
            id: newId(),
            title: d.label,
            dueDate: d.dueDate,
            completed: false,
            contractItemId: d.id,
            createdAt: now,
          })),
      ];
      const contract: Contract = { ...input, id, createdAt: now };
      const logId = newId();
      const { next } = apply({ type: "addContract", contract, tasks, logId });
      save(createContractAction(contract, tasks, newEntry(next, logId)));
      return id;
    },
    [apply, save]
  );

  /** Ticks or unticks a payment/deliverable on a contract (and its matching task). */
  const toggleContractItem = useCallback(
    (contractId: string, itemId: string) => {
      const logId = newId();
      const { prev, next } = apply({ type: "toggleContractItem", contractId, itemId, logId });
      const contract = next.contracts.find((c) => c.id === contractId);
      const payment = contract?.payments.find((p) => p.id === itemId);
      const deliverable = contract?.deliverables.find((d) => d.id === itemId);
      if (prev === next || (!payment && !deliverable)) return;
      const done = payment ? payment.paid : deliverable!.done;
      save(setContractItemDoneAction(contractId, itemId, done, newEntry(next, logId)));
    },
    [apply, save]
  );

  /** Changes a contract's status: draft, active or completed. */
  const setContractStatus = useCallback(
    (id: string, status: Contract["status"]) => {
      const logId = newId();
      const { prev, next } = apply({ type: "setContractStatus", id, status, logId });
      if (prev === next) return;
      save(setContractStatusAction(id, status, newEntry(next, logId)));
    },
    [apply, save]
  );

  /** Deletes a contract and all the tasks made from it. */
  const deleteContract = useCallback(
    (id: string) => {
      const logId = newId();
      const { prev, next } = apply({ type: "deleteContract", id, logId });
      if (prev === next) return;
      save(deleteContractAction(id, newEntry(next, logId)));
    },
    [apply, save]
  );

  /** Loads everything again from the database (picks up changes made by teammates). */
  const reloadData = useCallback(async () => {
    await load();
  }, [load]);

  /** Everything the app holds, as a JSON string suitable for a backup file. */
  const exportBackup = useCallback((exportedOn: ISODate): string => {
    const { events, tasks, sponsors, contracts, activity } = state;
    return JSON.stringify({ exportedOn, events, tasks, sponsors, contracts, activity }, null, 2);
  }, [state]);

  return {
    isReady: state.status === "ready",
    events: state.events,
    tasks: state.tasks,
    sponsors: state.sponsors,
    contracts: state.contracts,
    activity: state.activity,
    pillars,
    staff,
    currentUserId: state.currentUserId,
    saveError,
    loadError,
    clearSaveError,
    setCurrentUser,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    addEvent,
    updateEvent,
    deleteEvent,
    addSponsor,
    updateSponsor,
    addContract,
    toggleContractItem,
    setContractStatus,
    deleteContract,
    reloadData,
    exportBackup,
  };
}

/** The type of everything usePlannerStore() returns. Used by PlannerProvider. */
export type PlannerStore = ReturnType<typeof usePlannerStore>;
