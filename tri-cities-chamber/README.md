# Tri-Cities Chamber: Contracts, Events and Reminders (MVP)

Frontend-only MVP built from the Sept. 28 client meet and greet. Mock data,
client-side state saved in the browser, no backend.

## Run

```bash
npm install
npm run dev
npm test        # unit tests (Vitest)
npm run lint
npm run build
```

## What the client asked for, and where it is

| Client need (rating)                          | In the MVP                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| Effortless contract entry (5)                 | `/contracts/new`: upload (simulated auto-fill) or short manual form; payments and deliverables become calendar reminders automatically |
| Easy navigation for short-term interns (5)    | Four-item nav: bottom tab bar on phones, top bar on desktop; global "Signed in as" switcher |
| Sorting by event, pillar or partner           | `/contracts`: group by event / pillar / partner, sort by next due, value, partner, title, plus search |
| Signature event filter                        | Filter bar on Calendar, Contracts and Events                               |
| Calendar and reminders (not more e-blasts)    | `/`: month calendar, overdue / to-do markers, "Coming up" list             |
| Contract reader / summarizer                  | Summary card on each contract. **Demo only**: composed from entered fields, labelled as such |
| Trust and transparency (5)                    | History on every contract and "Recent changes" showing who changed what    |
| Loss prevention (2-3)                         | "Download backup" (JSON) in the footer; delete needs confirmation          |
| Phone, laptop and desktop                     | Mobile-first layout                                                        |
| Reporting (1)                                 | Deliberately minimal: three totals on the Contracts page                   |

Not built yet: real file storage, real AI reading, email or push notifications,
contract comparison, real sign-in and permissions.

## Structure

```
app/                       routes: / (calendar), /contracts, /contracts/new,
                           /contracts/[id], /events, /partners
components/app-shell/      layout, nav, PlannerProvider (shared store via context)
components/contracts/      list, card, form, detail, activity list
components/events/         events page + add-event dialog
components/partners/       partners page
components/planner/        calendar and task components
components/ui/             shadcn/ui primitives
hooks/use-planner-store.ts events, tasks, partners, contracts, activity + localStorage
lib/planner/
  types.ts                 domain types (flat, id-referenced, DB-ready)
  mock-data.ts             pillars, partners, staff, events, tasks
  mock-contracts.ts        contracts and activity
  contracts.ts             filter, sort, group, totals, demo summary and extraction
  selectors.ts, dates.ts   task selectors and date helpers
```

Contract payments and deliverables are mirrored as tasks (linked by
`contractItemId`). Ticking one side updates the other.

## Adding the backend later

Pages only talk to `usePlannerData()`, which wraps `usePlannerStore()`. Replace
that hook's internals with database calls and the UI should not need changes.
Types map onto tables: `events`, `tasks`, `sponsors`, `contracts`,
`payments`, `deliverables`, `activity`. Pillars and staff are placeholder
constants in `mock-data.ts`.

## Docs and AI workflow

Start with `docs/INFORMATION.md`: what each doc is for, and the commands to run
on every new branch (`/sync`, `/plan`, `/done`, `/landed`). Rules for the AI
assistant are in `CLAUDE.md`. Decisions are logged in `docs/DECISIONS.md` and
the current plan is in `docs/IMPLEMENTATION_PLAN.md`. `ARCHITECTURE.md` explains
how the files connect.
