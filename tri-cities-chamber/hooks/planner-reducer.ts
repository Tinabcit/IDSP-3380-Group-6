import type {
  ActivityEntry,
  ChamberEvent,
  Contract,
  EventInput,
  Sponsor,
  SponsorInput,
  Task,
  TaskInput,
} from "@/lib/planner/types";

/**
 * The store's reducer: the pure function that applies every data change.
 * Kept in its own file (no database or React imports) so it can be tested
 * on its own. hooks/use-planner-store.ts runs it and saves the result.
 *
 * Client-side store for events, tasks, partners and contracts.
 *
 * Persistence: the Supabase database, through the server actions in
 * lib/db/actions.ts (see usePlannerStore below). The public API (addTask,
 * addContract, ...) is what the UI depends on, so components did not change.
 *
 * Contract payments and deliverables are mirrored as tasks (linked by
 * `contractItemId`) so they show up on the calendar and in reminders. Ticking
 * either side updates the other.
 */

/** The lists of data the store holds (loaded from the database). */
export interface Data {
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
  | { type: "updateEvent"; id: string; input: EventInput; logId: string }
  | { type: "deleteEvent"; id: string; logId: string }
  | { type: "addSponsor"; sponsor: Sponsor }
  | { type: "updateSponsor"; id: string; input: SponsorInput; logId: string }
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
  // Keep the history bounded (the database load also returns the latest 200).
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
    case "updateEvent": {
      if (!state.events.some((e) => e.id === action.id)) return state;
      return {
        ...state,
        events: state.events.map((e) => (e.id === action.id ? { ...action.input, id: e.id } : e)),
        activity: log(state, action.logId, `Edited event ${action.input.name}`),
      };
    }
    case "deleteEvent": {
      const event = state.events.find((e) => e.id === action.id);
      if (!event) return state;
      // Tasks and contracts stay, they just stop pointing at the deleted event.
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.id),
        tasks: state.tasks.map((t) => (t.eventId === action.id ? { ...t, eventId: undefined } : t)),
        contracts: state.contracts.map((c) =>
          c.eventId === action.id ? { ...c, eventId: undefined } : c
        ),
        activity: log(state, action.logId, `Deleted event ${event.name}`),
      };
    }
    case "addSponsor":
      return { ...state, sponsors: [...state.sponsors, action.sponsor] };
    case "updateSponsor": {
      if (!state.sponsors.some((s) => s.id === action.id)) return state;
      return {
        ...state,
        sponsors: state.sponsors.map((s) => (s.id === action.id ? { ...action.input, id: s.id } : s)),
        activity: log(state, action.logId, `Edited sponsor ${action.input.name}`),
      };
    }

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
