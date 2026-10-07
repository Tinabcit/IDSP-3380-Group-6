# Decisions Log

Append-only. One entry per real architectural choice. Never rewrite or delete old entries.

The first five entries were reconstructed on 2026-10-07 from git history, README.md and ARCHITECTURE.md. Their "Alternatives considered" lines are inferred, not recorded at the time: confirm them with the team and correct them by adding a new entry.

## 2026-10-06 — Build a frontend-only MVP with mock data

Context: The Sept. 28 client meet and greet produced requirements, but there is no backend, budget or timeline for one yet.

Decision: Ship a frontend-only MVP with mock data and browser localStorage, so the client can react to something real (commit 0bbaf85).

Alternatives considered: Build a database and API first (rejected: slows feedback while requirements are still moving).

## 2026-10-06 — Next.js App Router with TypeScript, Tailwind and shadcn/ui

Context: Needed a working, deployable web starting point (create-next-app, commit e441972).

Decision: Next.js App Router, React, TypeScript, Tailwind 4, and Radix-based shadcn/ui primitives in components/ui.

Alternatives considered: Expo (rejected: the client needs phone, laptop and desktop browsers, and web covers all three).

## 2026-10-06 — One store behind a Provider; pages never change data directly

Context: Calendar, to-do, contracts, events and partners all share the same data.

Decision: hooks/use-planner-store.ts holds and changes all data, PlannerProvider shares it, and pages read it with usePlannerData().

Alternatives considered: Per-page state (rejected: data would drift between pages). A state library such as Zustand or Redux (rejected: more than the MVP needs).

## 2026-10-06 — Flat, id-referenced types that map onto future DB tables

Context: A real database is likely later.

Decision: Types in lib/planner/types.ts are flat and refer to each other by id (events, tasks, sponsors, contracts, payments, deliverables, activity). Swapping the store internals for database calls should not change the UI.

Alternatives considered: Nested objects (rejected: harder to map to tables).

## 2026-10-06 — Mirror contract payments and deliverables as tasks

Context: The client wants reminders on a calendar rather than more e-blasts.

Decision: Creating a contract creates a task per unpaid payment and unfinished deliverable (linked by contractItemId). Ticking either side updates the other, and deleting a contract deletes its tasks. Covered by tests in hooks/use-planner-store.test.ts.

Alternatives considered: A separate reminders list (rejected: duplicates the calendar and to-do).

## 2026-10-07 — Adopt the AI-assisted workflow (CLAUDE.md, docs/, skills, agents)

Context: The team follows the AI_Agent_Setup guide.

Decision: Add CLAUDE.md, .claude/skills (sync, plan, done, landed), .claude/agents, .claude/settings.json (Tier 2 permissions), Vitest for TDD, and the docs/ set. AGENTS.md is left untouched because next dev rewrites its Next.js block, and CLAUDE.md imports it.

Alternatives considered: Putting the workflow rules in AGENTS.md (rejected: it would be overwritten).
