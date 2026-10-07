/**
 * Domain types for the planner.
 *
 * Shapes are kept flat with id references so they map directly onto
 * relational tables (Supabase/Prisma) when the backend is added.
 * Dates are stored as ISO date strings ("yyyy-MM-dd") to avoid timezone drift.
 */

export type ISODate = string;

export interface Pillar {
  id: string;
  name: string;
}

export interface Sponsor {
  id: string;
  name: string;
}

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
}

export interface ChamberEvent {
  id: string;
  name: string;
  startDate: ISODate;
  /** Inclusive. Equal to startDate for single-day events. */
  endDate: ISODate;
  pillarId: string;
  isSignature: boolean;
  location?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: ISODate;
  completed: boolean;
  assigneeId: string;
  eventId?: string;
  sponsorId?: string;
  notes?: string;
  createdAt: string;
}

export type TaskStatus = "pending" | "overdue" | "completed";

/** Fields the user can set when creating or editing a task. */
export type TaskInput = Omit<Task, "id" | "createdAt" | "completed">;

export interface PlannerFilters {
  signatureOnly: boolean;
  pillarId: string | null;
  sponsorId: string | null;
}

export const EMPTY_FILTERS: PlannerFilters = {
  signatureOnly: false,
  pillarId: null,
  sponsorId: null,
};
