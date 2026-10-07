"use client";

import { useCallback, useEffect, useReducer } from "react";

import { todayISO } from "@/lib/planner/dates";
import { buildMockEvents, buildMockTasks } from "@/lib/planner/mock-data";
import type { ChamberEvent, Task, TaskInput } from "@/lib/planner/types";

/**
 * Client-side store for events and tasks.
 *
 * MVP persistence: localStorage, seeded from mock data on first visit.
 * The public API (addTask, updateTask, ...) is what the UI depends on,
 * so swapping the internals for Supabase calls later won't touch components.
 */

const STORAGE_KEY = "partner-calendar:v1";

interface PlannerState {
  status: "loading" | "ready";
  events: ChamberEvent[];
  tasks: Task[];
}

type Action =
  | { type: "hydrate"; events: ChamberEvent[]; tasks: Task[] }
  | { type: "add"; task: Task }
  | { type: "update"; id: string; input: TaskInput }
  | { type: "toggle"; id: string }
  | { type: "delete"; id: string };

function reducer(state: PlannerState, action: Action): PlannerState {
  switch (action.type) {
    case "hydrate":
      return { status: "ready", events: action.events, tasks: action.tasks };
    case "add":
      return { ...state, tasks: [...state.tasks, action.task] };
    case "update":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, ...action.input } : t
        ),
      };
    case "toggle":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, completed: !t.completed } : t
        ),
      };
    case "delete":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
  }
}

function seed() {
  const today = todayISO();
  return { events: buildMockEvents(today), tasks: buildMockTasks(today) };
}

function readStorage(): { events: ChamberEvent[]; tasks: Task[] } | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as { events?: unknown }).events) &&
      Array.isArray((parsed as { tasks?: unknown }).tasks)
    ) {
      return parsed as { events: ChamberEvent[]; tasks: Task[] };
    }
    return null;
  } catch {
    return null;
  }
}

function writeStorage(events: ChamberEvent[], tasks: Task[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ events, tasks }));
  } catch {
    // Storage full or blocked (private mode). The app keeps working in memory.
  }
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function usePlannerStore() {
  const [state, dispatch] = useReducer(reducer, {
    status: "loading",
    events: [],
    tasks: [],
  });
  // Load on the client only, so server and client markup match.
  useEffect(() => {
    const stored = readStorage();
    const data = stored ?? seed();
    dispatch({ type: "hydrate", ...data });
  }, []);

  useEffect(() => {
    if (state.status !== "ready") return;
    writeStorage(state.events, state.tasks);
  }, [state.status, state.events, state.tasks]);

  const addTask = useCallback((input: TaskInput) => {
    dispatch({
      type: "add",
      task: {
        ...input,
        id: createId(),
        completed: false,
        createdAt: new Date().toISOString(),
      },
    });
  }, []);

  const updateTask = useCallback((id: string, input: TaskInput) => {
    dispatch({ type: "update", id, input });
  }, []);

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: "toggle", id });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: "delete", id });
  }, []);

  const resetDemoData = useCallback(() => {
    dispatch({ type: "hydrate", ...seed() });
  }, []);

  return {
    isReady: state.status === "ready",
    events: state.events,
    tasks: state.tasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    resetDemoData,
  };
}

export type PlannerStore = ReturnType<typeof usePlannerStore>;
