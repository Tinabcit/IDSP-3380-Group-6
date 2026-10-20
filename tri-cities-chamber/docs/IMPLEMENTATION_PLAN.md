# Implementation Plan: Tri-Cities Chamber Contracts, Events and Reminders (MVP)

Phases 1-3 were reconstructed from git history. Several phases can be open at once: one phase = one branch = one person. Each phase's `Branch:` line names the branch that does it, and `/done` on that branch ticks only that phase's boxes.

## Phase 1 — Scaffold and calendar/to-do (commits e441972, 0bbaf85)

- [x] Generate Next.js project (App Router, TypeScript, Tailwind, shadcn/ui)
- [x] Domain types, mock data, date helpers, selectors
- [x] Planner store with localStorage and PlannerProvider
- [x] Month calendar with filters, to-do list, task form dialog

## Phase 2 — Contracts, events, partners (commit 19e16be)

- [x] Contract types, mock contracts, filter/sort/group helpers
- [x] /contracts list, /contracts/new form, /contracts/[id] detail with history
- [x] Contract payments and deliverables mirrored as tasks
- [x] /events and /partners pages
- [x] Navigation bar, "Signed in as" switcher, "Coming up" panel and JSON backup button

## Phase 3 — Documentation and document reader prototype

- [x] Plain-language comments on every ts/tsx file, and ARCHITECTURE.md (commit 664fb91)
- [x] Document reader sandbox prototype in /sandbox/document-reader (PR #1)

## Phase 4 — AI workflow and test foundation

Branch: features/ai-workflow-setup

- [x] CLAUDE.md, .claude/skills (sync, plan (now /phase), done, landed), docs/ discovery set
- [x] Vitest, `npm test` script, tests for dates, selectors, contracts and the store reducer
- [x] Agents in .claude/agents, permissions in .claude/settings.json, .env in .gitignore
- [x] README.md gains an `npm test` line and a "Docs and AI workflow" section; ARCHITECTURE.md gains section 8, Tests
- [x] Keep docs current per PR: /done runs the docs-updater agent, PR template added
- [x] docs/TEAM_QUICKSTART.md: one-page command guide for teammates
- [x] docs/DISCOVERY.md, USER_RESEARCH.md and COMPETITIVE_MATRIX.md created; open questions marked TODO for the client

## Phase 5 - Toast Notification

Branch: features/toastNotification

- [x] cd into tri-cities-chamber
- [x] add Toast Notification to provide feedback on users when creating calender, contracts, etc.
- [x] When users calender sheducle is due 1-2 days earlier they should receive a notification [toast notication] and should be displayed in top right corner with a bell icon to showcase.
- [x] In the homepage there should be a bell icon on the right top corner that shows all overdue notifications and when you click it, it brings you to all the overdues or the selected overdues.

## Phase 6 - Calander fixes/optimization/events (Current)

Branch: feature/calendar-events

- [x] cd into tri-cities-chamber
- [x] Event model: add startTime, endTime, description and category to ChamberEvent (lib/planner/types.ts); update the seed in mock-data.ts; new fields are optional, so saved data keeps working and the storage key is unchanged
- [x] Store: updateEvent and deleteEvent (reducer cases, hook functions, activity log); deleting an event clears eventId on linked tasks and contracts; tests in hooks/use-planner-store.test.ts
- [x] Pure helpers in lib/planner: time parse/format/sort, eventsOnDate sorted by time, ?date= validation; tests first
- [x] Month/year picker in MonthHeader alongside prev/next
- [x] Extract NewEventForm into a shared create/edit EventFormDialog, reused by /events
- [x] Calendar: "Add event" button, DayPanel list with edit and delete (AlertDialog confirm), click a day to see its events
- [x] Day cells: event chips with category colour and badge; keep the "+N more" overflow
- [x] Toast on event create, update and delete
- [x] Empty state for months with no events; loading state while data hydrates (no fetching in the MVP)
- [x] Year boundary and timezone edge cases (Dec/Jan navigation, multi-day events across year end); tests for getMonthGrid, toISODate, fromISODate

## Backlog (not a phase yet — /phase turns these into the next phase)

From the README "Not built yet" list: real file storage, real AI contract reading, email/push notifications, contract comparison, real sign-in and permissions, backend.

Also: fill the TODO lines in docs/DISCOVERY.md and COMPETITIVE_MATRIX.md with the client and team. Test gaps found in the Phase 4 review: tasks built in addContract, readStorage, reducer cases setUser/addSponsor/addEvent, most of lib/planner/dates.ts, and updateTask writing history for an unknown id.
