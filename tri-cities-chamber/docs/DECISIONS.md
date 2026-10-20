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

## 2026-10-07 — Shared Claude Code plugins: typescript-lsp only

Context: The shared root .claude/settings.json (f815fcb) enabled five plugins. This is a frontend-only MVP with no backend.

Decision: The shared settings enable only typescript-lsp. Any other plugin is enabled in a person's own .claude/settings.local.json.

Alternatives considered: Keeping all five in the shared file (rejected: supabase and vercel imply a backend we have not chosen).

## 2026-10-07 — Rename the /plan command to /phase

Context: The bare name /plan resolves to a Claude Code built-in command (plan mode), so our skill was only reachable as tri-cities-chamber:plan. Confirmed by a skill-tool test: `plan` was rejected as a UI command and `tri-cities-chamber:plan` loaded.

Decision: Rename the skill from /plan to /phase (folder .claude/skills/phase). Nothing else changes: it still reads docs/, writes the next phase to IMPLEMENTATION_PLAN.md and logs decisions in DECISIONS.md. /phase matched no built-in command, bundled skill or installed plugin in this session or in the Claude Code commands docs. Older entries above still say /plan; that was the name at the time.

Alternatives considered: Keeping /plan and typing tri-cities-chamber:plan (rejected: easy to mistype, and the plain /plan would silently start plan mode). Other names such as /design (rejected: the guide warns it collides with a built-in).

## 2026-10-07 — /phase records the branch name; /done uses it to pick scope

Context: /done decided Project scope from any unchecked plan item, and the plan always has unchecked items, so every run looked like Project.

Decision: /phase writes `Branch: <name>` under each new phase heading in IMPLEMENTATION_PLAN.md. /done picks Project scope only when a phase's Branch line matches the current branch. Older reconstructed phases have no Branch line because their branch names are not recorded.

Alternatives considered: Matching plan items by branch name or keywords (rejected: fragile). Always asking the user for the scope (rejected: slows small PRs).

## 2026-10-14 — Where we differ from the AI_Agent_Setup guide

Context: A review against the guide found three places where our workflow does something different from it.

Decision: (1) Quick scope opens a PR into dev instead of committing and pushing to main, because nobody commits to dev or main. (2) There is no CHANGELOG file. /done Standard fills a Changelog section in the PR description, so the merged PRs into dev are the changelog. (3) IMPLEMENTATION_PLAN.md keeps finished phases as history instead of being cleared after each feature. /landed still offers to archive it once every item is checked.

Alternatives considered: A CHANGELOG.md file that every PR appends to (rejected: PRs that run at the same time would conflict on it). Pushing small fixes straight to main, as the guide's Quick scope does (rejected: skips review, and the settings deny pushes to dev and main).

## 2026-10-14 — Several open phases at once, one per branch

Context: The plan said to add the next phase only when the current one is done. With four developers working at the same time, that forces everyone to wait, and if each person runs /phase on their own branch, the new phases land in the same spot of IMPLEMENTATION_PLAN.md and conflict.

Decision: Several phases can be open at once. One phase = one branch = one person, named on the phase's `Branch:` line. New phases are planned together on a small planning branch and merged into dev before coding starts. /phase may add more than one phase and asks for the branch name and owner when the phase is for another branch. Phases no longer contain a "merge this branch" item, because no PR can tick it before its own merge; the Phase 4 one was removed.

Alternatives considered: Keeping one phase at a time (rejected: blocks three of four people). Each person running /phase on their own branch (rejected: plan conflicts on every PR). One shared phase with items assigned to people (rejected: /done picks scope by branch, so several branches would match one phase).

## 2026-10-16 — Toasts built in-house, reminders shown once per task per day

Context: Phase 5 needs toast feedback after create/edit/delete actions and a bell-icon reminder for tasks due in 1-2 days. CLAUDE.md says to ask before adding dependencies.

Decision: Build a small ToastProvider/useToast (no new package) that draws toasts in the top right corner. ReminderToasts (in the app shell) shows a bell toast for each open task assigned to the signed-in person that is due tomorrow or in 2 days. Shown reminders are remembered in localStorage per day, so a refresh does not repeat them. Overdue and due-today tasks are not reminded (the calendar already highlights them).

Alternatives considered: The sonner package (rejected: new dependency needs team approval). A bell button with an unread list in the header (rejected: the phase asks for toasts).

## 2026-10-16 — Header bell lists all overdue tasks and links into the calendar

Context: Phase 5 asks for a bell in the top right of the home page that shows overdue items and takes the user to them.

Decision: A bell in the header (all pages) shows a red count of every open overdue task, for the whole team, matching the "Coming up" panel. Clicking a task opens "/?date=<due date>", which selects that day on the calendar. "View all overdue" opens "/#upcoming-heading", the Coming up list, where overdue tasks come first.

Alternatives considered: Only the signed-in person's overdue tasks (rejected: the demo user may have none and the panel is team-wide). A separate overdue page (rejected: more surface than the phase asks for).

## 2026-10-19 — Event CRUD lives in the store; no API routes; Figma item dropped

Context: Phase 6 first listed "API endpoints for CRUD on events" and "Match layout to Figma calendar design". The MVP is frontend-only, and no Figma file is in the repo.

Decision: Events are created, edited and deleted through updateEvent/deleteEvent in hooks/use-planner-store.ts, like every other record. No app/api routes are added. The Figma item is removed from Phase 6 until a design is supplied. The Branch line is feature/calendar-events, matching the working branch.

Alternatives considered: Next.js route handlers with server storage (rejected: needs a backend decision the team has not made). Keeping the Figma item with no file to work from (rejected: it cannot be checked off).
