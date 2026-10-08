# Implementation Plan: Tri-Cities Chamber Contracts, Events and Reminders (MVP)

Phases 1-3 were reconstructed from git history. Add the next phase with /phase only when the current one is done.

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

## Phase 4 — AI workflow and test foundation (current)

Branch: docs/ai-workflow-setup

- [x] CLAUDE.md, .claude/skills (sync, plan, done, landed), docs/ discovery set
- [x] Vitest, `npm test` script, tests for dates, selectors, contracts and the store reducer
- [x] Agents in .claude/agents, permissions in .claude/settings.json, .env in .gitignore
- [x] README.md gains an `npm test` line and a "Docs and AI workflow" section; ARCHITECTURE.md gains section 8, Tests
- [x] Keep docs current per PR: /done runs the docs-updater agent, PR template added
- [x] docs/TEAM_QUICKSTART.md: one-page command guide for teammates
- [ ] Fill in the TODO lines in docs/DISCOVERY.md, USER_RESEARCH.md and COMPETITIVE_MATRIX.md with the client and team
- [ ] Merge this branch to dev (/done, then /landed)

## Backlog (not a phase yet — /phase turns these into the next phase)

From the README "Not built yet" list: real file storage, real AI contract reading, email/push notifications, contract comparison, real sign-in and permissions, backend.
