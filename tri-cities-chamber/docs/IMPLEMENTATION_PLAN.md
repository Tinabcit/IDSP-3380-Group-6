# Implementation Plan: Tri-Cities Chamber Contracts, Events and Reminders (MVP)

Phases 1-4 were reconstructed from git history. Add the next phase with /plan only when the current one is done.

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

## Phase 3 — Documentation (commit 664fb91)

- [x] Plain-language comments on every ts/tsx file
- [x] ARCHITECTURE.md

## Phase 4 — Split sandbox pages (commit 099ad4f)

- [x] Standalone /calendar and /todo pages
- [x] Sandbox index at /

## Phase 5 — AI workflow and test foundation (current)

- [x] CLAUDE.md, .claude/skills (sync, plan, done, landed), docs/ discovery set
- [x] Vitest, `npm test` script, tests for dates, selectors, contracts and the store reducer
- [x] Agents in .claude/agents, permissions in .claude/settings.json, .env in .gitignore
- [x] README.md and ARCHITECTURE.md updated to match the sandbox pages
- [ ] Fill in the TODO lines in docs/DISCOVERY.md, USER_RESEARCH.md and COMPETITIVE_MATRIX.md with the client and team
- [ ] Commit this phase and open a PR to dev (/done)

## Backlog (not a phase yet — /plan turns these into the next phase)

Gaps found in the code while updating the README:

- Add a "Download backup" button (the store's `exportBackup` exists, no UI uses it). The delete-contract dialog already tells users to download a backup
- Rebuild navigation for interns (the shared nav was removed in the sandbox split)
- Bring back a "Signed in as" switcher (`setCurrentUser` exists, no UI uses it)
- Show a "Coming up" list (`upcomingTasks` exists, no UI uses it)

From the README "Not built yet" list: real file storage, real AI contract reading, email/push notifications, contract comparison, real sign-in and permissions, backend.
