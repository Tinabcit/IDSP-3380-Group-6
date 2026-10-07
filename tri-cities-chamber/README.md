# Partner Calendar (Calendar + To-Do MVP)

Frontend-only MVP for tracking chamber events and sponsor deliverables.
Mock data, client-side state, no backend.

## Run

```bash
npm install
npm run dev
```

## Features

- Month calendar with signature events marked by a gold ribbon, plus markers for overdue, to-do and completed tasks
- Month navigation, Today button and full keyboard support in the grid (arrows, Home/End, PageUp/PageDown)
- Selected-day panel with that day's events and tasks
- "Coming up" list: overdue tasks plus anything due in the next 7 days
- Add, edit, delete (with confirmation) and complete tasks
- Tasks link to an assignee, an event and a sponsor
- Filters: signature events only, pillar, sponsor
- Mobile-first: compact grid on phones, bottom-sheet dialogs, event names on tablet and up

## Structure

```
app/                       page + layout (Public Sans via next/font)
components/ui/             shadcn/ui primitives
components/planner/        feature components
  planner-app.tsx          root: view state, filters, wiring
  month-grid.tsx           calendar grid (roving tabindex)
  day-panel.tsx            selected day
  upcoming-panel.tsx       next 7 days
  task-item.tsx            task row with complete/edit/delete
  task-form-dialog.tsx     create/edit form
  filter-bar.tsx
hooks/
  use-planner-store.ts     task/event state + localStorage persistence
  use-today.ts             current date, rolls over at midnight
lib/planner/
  types.ts                 domain types (flat, id-referenced, DB-ready)
  mock-data.ts             pillars, sponsors, staff, seeded events/tasks
  selectors.ts             filtering, sorting, status, per-day summaries
  dates.ts                 date helpers (ISO yyyy-MM-dd strings)
```

## Adding the backend later

Components only talk to `usePlannerStore()` (`tasks`, `events`, `addTask`,
`updateTask`, `toggleTask`, `deleteTask`). Replace that hook's internals with
Supabase queries and mutations and the UI should not need changes. The types in
`lib/planner/types.ts` map one-to-one onto tables: `events`, `tasks`,
`sponsors`, `pillars`, `staff`.

Pillars, sponsors and staff are placeholder values in `mock-data.ts`.
