# Tri-Cities Chamber: Contracts, Events and Reminders (MVP)

Frontend-only MVP built from the Sept. 28 client meet and greet. Mock data,
client-side state saved in the browser (localStorage), no backend.

Right now the app is a **sandbox**: every page stands alone, reached from a list
of links at `/`. There is no shared menu, sign-in or footer yet
(see `docs/DECISIONS.md`, 2026-10-07).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests (Vitest)
npm run lint
npm run build
```

## Pages

| URL | What it does |
| --- | --- |
| `/` | Sandbox index: links to every page |
| `/calendar` | Month calendar with events and task markers (overdue / pending / done), plus filters |
| `/todo` | Task list: add, edit, tick and delete tasks |
| `/contracts` | Contract list: group by event / pillar / partner, sort by next due, value, partner or title, search, three totals, and a "Recent changes" history |
| `/contracts/new` | Add a contract: upload (simulated auto-fill) or a short manual form |
| `/contracts/[id]` | One contract: payments, deliverables, status, demo summary, history, delete with confirmation |
| `/events` | Upcoming and past events, add an event |
| `/partners` | Partners and their contracts |

## What the client asked for, and where it is

| Client need (rating) | Status |
| --- | --- |
| Effortless contract entry (5) | Done: `/contracts/new`. Payments and deliverables become calendar reminders automatically. Upload auto-fill is **simulated** from the file name |
| Easy navigation for short-term interns (5) | **Not in this sandbox.** The nav bar was removed when the pages were split; to be rebuilt |
| Sorting by event, pillar or partner | Done: `/contracts` |
| Signature event filter | Done: filter bar on Calendar, Contracts and Events |
| Calendar and reminders (not more e-blasts) | Done: `/calendar` and `/todo`. No "Coming up" list in the UI yet (the `upcomingTasks` helper exists) |
| Contract reader / summarizer | **Demo only**: a summary composed from the entered fields |
| Trust and transparency (5) | Done: history on each contract and "Recent changes" showing who changed what. The "Signed in as" switcher was removed with the nav, so changes are attributed to the default staff member |
| Loss prevention (2-3) | Delete needs confirmation. The JSON backup exists in the store (`exportBackup`) but has **no button yet** |
| Phone, laptop and desktop | Mobile-first layout |
| Reporting (1) | Deliberately minimal: three totals on the Contracts page |

Not built yet: real file storage, real AI reading, email or push notifications,
contract comparison, real sign-in and permissions, a backend.

## Project layout

```
app/                       routes (one folder per URL above)
components/app-shell/      PlannerProvider (shares the store through context)
components/sandbox/        "Sandbox home" link shown on each page
components/calendar/       calendar page
components/todo/           to-do page
components/planner/        shared calendar and task pieces (grid, filters, task form)
components/contracts/      list, card, form, detail, activity list
components/events/         events page and add-event dialog
components/partners/       partners page
components/ui/             shadcn/ui primitives
hooks/use-planner-store.ts all data + localStorage (reducer is tested)
lib/planner/               types, mock data, and pure helpers (dates, selectors, contracts)
docs/                      project docs, see below
.claude/                   AI workflow: skills (commands), agents, shared settings
```

Contract payments and deliverables are mirrored as tasks (linked by
`contractItemId`). Ticking one side updates the other. See `ARCHITECTURE.md` for
the full picture of how files connect.

## Docs and AI workflow

Start with `docs/INFORMATION.md`: what each doc is for, and the commands to run
on every new branch (`/sync`, `/plan`, `/done`, `/landed`). Rules for the AI
assistant are in `CLAUDE.md`. Decisions are logged in `docs/DECISIONS.md` and
the current plan is in `docs/IMPLEMENTATION_PLAN.md`.

## Adding the backend later

Pages only talk to `usePlannerData()`, which wraps `usePlannerStore()`. Replace
that hook's internals with database calls and the UI should not need changes;
the reducer tests in `hooks/use-planner-store.test.ts` describe the behaviour
to keep. Types map onto tables: `events`, `tasks`, `sponsors`, `contracts`,
`payments`, `deliverables`, `activity`. Pillars and staff are placeholder
constants in `mock-data.ts`.
