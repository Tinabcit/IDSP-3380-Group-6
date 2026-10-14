"use client";

import { useCallback, useEffect, useReducer } from "react";

import { todayISO } from "@/lib/planner/dates";
import { buildMockEvents, buildMockTasks, SPONSORS, STAFF } from "@/lib/planner/mock-data";
import { buildMockActivity, buildMockContracts } from "@/lib/planner/mock-contracts";
import type {
  ActivityEntry,
  ChamberEvent,
  Contract,
  ContractInput,
  ISODate,
  Sponsor,
  Task,
  TaskInput,
} from "@/lib/planner/types";

/**
 * Client-side store for events, tasks, partners and contracts.
 *
 * MVP persistence: localStorage, seeded from mock data on first visit.
 * The public API (addTask, addContract, ...) is what the UI depends on, so
 * swapping the internals for database calls later won't touch components.
 *
 * Contract payments and deliverables are mirrored as tasks (linked by
 * `contractItemId`) so they show up on the calendar and in reminders. Ticking
 * either side updates the other.
 */

/**
 * The name the data is saved under in the browser's localStorage.
 * Change the version number (v2) if the shape of the saved data changes,
 * so old saved data is ignored.
 */
const STORAGE_KEY = "partner-calendar:v2";

/** The lists of data that get saved in the browser. */
interface Data {
  events: ChamberEvent[];
  tasks: Task[];
  sponsors: Sponsor[];
  contracts: Contract[];
  activity: ActivityEntry[];
}

/**
 * Everything the store holds: the saved data, plus whether it has loaded yet
 * and who is signed in.
 */
export interface PlannerState extends Data {
  status: "loading" | "ready";
  currentUserId: string;
}

/**
 * All the things that can change the data (add a task, delete a contract, ...).
 * Each one has a "type" name and the details it needs. logId is an id for the
 * history entry, made before the reducer runs so the reducer stays predictable.
 */
export type Action =
  | { type: "hydrate"; data: Data; currentUserId?: string }
  | { type: "setUser"; id: string }
  | { type: "addTask"; task: Task; logId: string }
  | { type: "updateTask"; id: string; input: TaskInput; logId: string }
  | { type: "toggleTask"; id: string; logId: string }
  | { type: "deleteTask"; id: string; logId: string }
  | { type: "addEvent"; event: ChamberEvent; logId: string }
  | { type: "addSponsor"; sponsor: Sponsor }
  | { type: "addContract"; contract: Contract; tasks: Task[]; logId: string }
  | { type: "toggleContractItem"; contractId: string; itemId: string; logId: string }
  | { type: "setContractStatus"; id: string; status: Contract["status"]; logId: string }
  | { type: "deleteContract"; id: string; logId: string };

/** Adds a new line to the history list (newest first). Only the latest 200 are kept. */
function log(
  state: PlannerState,
  id: string,
  message: string,
  contractId?: string
): ActivityEntry[] {
  const entry: ActivityEntry = {
    id,
    at: new Date().toISOString(),
    userId: state.currentUserId,
    message,
    contractId,
  };
  // Keep the history bounded so localStorage never fills up.
  return [entry, ...state.activity].slice(0, 200);
}

/**
 * The "reducer": one function that takes the current data plus an action and
 * returns the new data. All data changes happen here. Special cases:
 * - ticking a task made from a contract also ticks the payment/deliverable
 * - ticking a payment/deliverable also ticks its task
 * - deleting a contract also deletes the tasks made from it
 */
export function reducer(state: PlannerState, action: Action): PlannerState {
  switch (action.type) {
    case "hydrate":
      return {
        ...state,
        ...action.data,
        status: "ready",
        currentUserId: action.currentUserId ?? state.currentUserId,
      };
    case "setUser":
      return { ...state, currentUserId: action.id };

    case "addTask":
      return {
        ...state,
        tasks: [...state.tasks, action.task],
        activity: log(state, action.logId, `Added task "${action.task.title}"`, action.task.contractId),
      };
    case "updateTask":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, ...action.input } : t)),
        activity: log(state, action.logId, `Edited task "${action.input.title}"`),
      };
    case "toggleTask": {
      const task = state.tasks.find((t) => t.id === action.id);
      if (!task) return state;
      const completed = !task.completed;
      const syncItem = task.contractId && task.contractItemId;
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === task.id ? { ...t, completed } : t)),
        contracts: syncItem
          ? state.contracts.map((c) =>
              c.id === task.contractId ? setItemDone(c, task.contractItemId!, completed) : c
            )
          : state.contracts,
        activity: log(
          state,
          action.logId,
          `Marked "${task.title}" as ${completed ? "done" : "not done"}`,
          task.contractId
        ),
      };
    }
    case "deleteTask": {
      const task = state.tasks.find((t) => t.id === action.id);
      if (!task) return state;
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.id),
        activity: log(state, action.logId, `Deleted task "${task.title}"`, task.contractId),
      };
    }

    case "addEvent":
      return {
        ...state,
        events: [...state.events, action.event],
        activity: log(state, action.logId, `Added event ${action.event.name}`),
      };
    case "addSponsor":
      return { ...state, sponsors: [...state.sponsors, action.sponsor] };

    case "addContract":
      return {
        ...state,
        contracts: [action.contract, ...state.contracts],
        tasks: [...state.tasks, ...action.tasks],
        activity: log(state, action.logId, `Added contract ${action.contract.title}`, action.contract.id),
      };
    case "toggleContractItem": {
      const contract = state.contracts.find((c) => c.id === action.contractId);
      if (!contract) return state;
      const payment = contract.payments.find((p) => p.id === action.itemId);
      const deliverable = contract.deliverables.find((d) => d.id === action.itemId);
      const label = (payment ?? deliverable)?.label;
      if (!label) return state;
      const done = !(payment ? payment.paid : deliverable!.done);
      const verb = payment ? (done ? "paid" : "unpaid") : done ? "done" : "not done";
      return {
        ...state,
        contracts: state.contracts.map((c) =>
          c.id === contract.id ? setItemDone(c, action.itemId, done) : c
        ),
        tasks: state.tasks.map((t) =>
          t.contractItemId === action.itemId ? { ...t, completed: done } : t
        ),
        activity: log(
          state,
          action.logId,
          `Marked "${label}" as ${verb} on ${contract.title}`,
          contract.id
        ),
      };
    }
    case "setContractStatus": {
      const contract = state.contracts.find((c) => c.id === action.id);
      if (!contract) return state;
      return {
        ...state,
        contracts: state.contracts.map((c) =>
          c.id === action.id ? { ...c, status: action.status } : c
        ),
        activity: log(state, action.logId, `Set ${contract.title} to ${action.status}`, contract.id),
      };
    }
    case "deleteContract": {
      const contract = state.contracts.find((c) => c.id === action.id);
      if (!contract) return state;
      return {
        ...state,
        contracts: state.contracts.filter((c) => c.id !== action.id),
        tasks: state.tasks.filter((t) => t.contractId !== action.id),
        activity: log(state, action.logId, `Deleted contract ${contract.title}`),
      };
    }
  }
}

/** Marks one payment as paid (or one deliverable as done) on a contract. */
function setItemDone(contract: Contract, itemId: string, done: boolean): Contract {
  return {
    ...contract,
    payments: contract.payments.map((p) => (p.id === itemId ? { ...p, paid: done } : p)),
    deliverables: contract.deliverables.map((d) => (d.id === itemId ? { ...d, done } : d)),
  };
}

/**
 * Makes a fresh set of demo data. Dates are based on today, so the calendar
 * always looks current.
 */
function seed(): Data {
  const today = todayISO();
  return {
    events: buildMockEvents(today),
    tasks: buildMockTasks(today),
    sponsors: SPONSORS,
    contracts: buildMockContracts(today),
    activity: buildMockActivity(),
  };
}

/** What gets saved in the browser: the data plus who is signed in. */
interface Stored extends Data {
  currentUserId?: string;
}

/**
 * Reads the saved data from the browser and checks it looks right.
 * Returns null if there is none or it is broken (then we use demo data instead).
 */
function readStorage(): Stored | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored> | null;
    if (
      parsed &&
      Array.isArray(parsed.events) &&
      Array.isArray(parsed.tasks) &&
      Array.isArray(parsed.sponsors) &&
      Array.isArray(parsed.contracts) &&
      Array.isArray(parsed.activity)
    ) {
      return parsed as Stored;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Saves the data in the browser. If saving fails (e.g. storage is full) it is
 * ignored, so the app still works - it just won't remember things.
 */
function writeStorage(stored: Stored) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage full or blocked (private mode). The app keeps working in memory.
  }
}

/**
 * Makes a unique id such as "task-3f2a...". Uses a built-in generator when the
 * browser has one, otherwise the time plus a random number.
 */
function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Extra settings for creating a contract. */
export interface NewContractOptions {
  /** Who the generated reminder tasks are assigned to. */
  assigneeId: string;
}

/**
 * The one hook that holds all the app data. It is called ONCE, in
 * PlannerProvider; other components get the data with usePlannerData().
 * It gives back the data lists plus functions to change them (add, update,
 * toggle, delete, ...).
 */
export function usePlannerStore() {
  const [state, dispatch] = useReducer(reducer, {
    status: "loading",
    events: [],
    tasks: [],
    sponsors: [],
    contracts: [],
    activity: [],
    currentUserId: STAFF[0].id,
  });

  // Load on the client only, so server and client markup match.
  useEffect(() => {
    const stored = readStorage();
    dispatch({
      type: "hydrate",
      data: stored ?? seed(),
      currentUserId: stored?.currentUserId,
    });
  }, []);

  useEffect(() => {
    if (state.status !== "ready") return;
    const { events, tasks, sponsors, contracts, activity, currentUserId } = state;
    writeStorage({ events, tasks, sponsors, contracts, activity, currentUserId });
  }, [state]);

  /** Changes who is signed in (used in the history and as the default assignee). */
  const setCurrentUser = useCallback((id: string) => dispatch({ type: "setUser", id }), []);

  /** Creates a new task (not done yet) from the form values and records it in the history. */
  const addTask = useCallback((input: TaskInput) => {
    dispatch({
      type: "addTask",
      logId: createId("act"),
      task: {
        ...input,
        id: createId("task"),
        completed: false,
        createdAt: new Date().toISOString(),
      },
    });
  }, []);

  /** Updates the fields of an existing task. */
  const updateTask = useCallback((id: string, input: TaskInput) => {
    dispatch({ type: "updateTask", id, input, logId: createId("act") });
  }, []);

  /** Ticks or unticks a task (and its matching payment/deliverable, if it has one). */
  const toggleTask = useCallback((id: string) => {
    dispatch({ type: "toggleTask", id, logId: createId("act") });
  }, []);

  /** Deletes a task. The contract it came from is not changed. */
  const deleteTask = useCallback((id: string) => {
    dispatch({ type: "deleteTask", id, logId: createId("act") });
  }, []);

  /** Adds an event and returns its new id. */
  const addEvent = useCallback((input: Omit<ChamberEvent, "id">): string => {
    const id = createId("event");
    dispatch({ type: "addEvent", event: { ...input, id }, logId: createId("act") });
    return id;
  }, []);

  /** Adds a partner (sponsor) and returns its new id. */
  const addSponsor = useCallback((input: Omit<Sponsor, "id">): string => {
    const id = createId("sponsor");
    dispatch({ type: "addSponsor", sponsor: { ...input, id } });
    return id;
  }, []);

  /**
   * Saves the contract and creates a reminder task for every unpaid payment
   * and unfinished deliverable, so entry is one step instead of two.
   */
  const addContract = useCallback(
    (input: ContractInput, { assigneeId }: NewContractOptions): string => {
      const id = createId("contract");
      const now = new Date().toISOString();
      const base = { assigneeId, eventId: input.eventId, sponsorId: input.sponsorId, contractId: id };
      const tasks: Task[] = [
        ...input.payments
          .filter((p) => !p.paid)
          .map((p) => ({
            ...base,
            id: createId("task"),
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
            id: createId("task"),
            title: d.label,
            dueDate: d.dueDate,
            completed: false,
            contractItemId: d.id,
            createdAt: now,
          })),
      ];
      dispatch({
        type: "addContract",
        contract: { ...input, id, createdAt: now },
        tasks,
        logId: createId("act"),
      });
      return id;
    },
    []
  );

  /** Ticks or unticks a payment/deliverable on a contract (and its matching task). */
  const toggleContractItem = useCallback((contractId: string, itemId: string) => {
    dispatch({ type: "toggleContractItem", contractId, itemId, logId: createId("act") });
  }, []);

  /** Changes a contract's status: draft, active or completed. */
  const setContractStatus = useCallback((id: string, status: Contract["status"]) => {
    dispatch({ type: "setContractStatus", id, status, logId: createId("act") });
  }, []);

  /** Deletes a contract and all the tasks made from it. */
  const deleteContract = useCallback((id: string) => {
    dispatch({ type: "deleteContract", id, logId: createId("act") });
  }, []);

  /** Deletes everything and loads the demo data again. */
  const resetDemoData = useCallback(() => {
    dispatch({ type: "hydrate", data: seed() });
  }, []);

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
    currentUserId: state.currentUserId,
    setCurrentUser,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    addEvent,
    addSponsor,
    addContract,
    toggleContractItem,
    setContractStatus,
    deleteContract,
    resetDemoData,
    exportBackup,
  };
}

/** The type of everything usePlannerStore() returns. Used by PlannerProvider. */
export type PlannerStore = ReturnType<typeof usePlannerStore>;
