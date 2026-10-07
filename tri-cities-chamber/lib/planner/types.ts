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
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
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
  /** Set when the task was generated from a contract payment or deliverable. */
  contractId?: string;
  /** The payment or deliverable this task mirrors, kept in sync both ways. */
  contractItemId?: string;
  notes?: string;
  createdAt: string;
}

export type ContractStatus = "draft" | "active" | "completed";

export interface PaymentInstalment {
  id: string;
  label: string;
  dueDate: ISODate;
  amount: number;
  paid: boolean;
}

export interface Deliverable {
  id: string;
  label: string;
  dueDate: ISODate;
  done: boolean;
}

export interface ContractSummary {
  overview: string;
  keyTerms: string[];
  /** Things staff should double-check, shown separately from key terms. */
  watchouts: string[];
}

/** A sponsorship agreement between a partner and (usually) one event. */
export interface Contract {
  id: string;
  title: string;
  sponsorId: string;
  eventId?: string;
  /** Total sponsorship value in CAD. */
  amount: number;
  status: ContractStatus;
  signedDate?: ISODate;
  fileName?: string;
  payments: PaymentInstalment[];
  deliverables: Deliverable[];
  summary?: ContractSummary;
  notes?: string;
  createdAt: string;
}

export type ContractInput = Omit<Contract, "id" | "createdAt">;

/** A line in the shared history so everyone can see who changed what. */
export interface ActivityEntry {
  id: string;
  at: string;
  userId: string;
  message: string;
  contractId?: string;
}

export type ContractGroupBy = "none" | "event" | "pillar" | "partner";
export type ContractSortBy = "nextDue" | "amount" | "title" | "partner";

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
