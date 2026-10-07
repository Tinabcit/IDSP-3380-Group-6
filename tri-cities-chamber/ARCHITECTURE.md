# How the app fits together

A quick guide to where things are and how they connect.
Arrow `->` means "uses / shows". Every function also has a comment in its own file.

## 1. Quick glossary

| Word | Meaning here |
| --- | --- |
| **Page** | A file in `app/`. One page = one web address (URL). |
| **Component** | A reusable piece of screen (a button, a calendar, a form). |
| **Hook** | A function that starts with `use...` and gives a component some data or behaviour. |
| **Store** | The place where ALL the app data lives (`hooks/use-planner-store.ts`). |
| **Provider** | Shares the store with every component (`planner-provider.tsx`). |
| **Task** | A to-do item with a due date. |
| **Contract** | A sponsorship deal. Has payments and deliverables. |
| **Pillar** | A focus area of the chamber. Each event belongs to one. |

## 2. The 30-second version

```text
 Browser storage (localStorage)
        ^   |
        |   v
 [1] Store          hooks/use-planner-store.ts      holds + changes the data
        |
        v
 [2] Provider       components/app-shell/planner-provider.tsx    shares it
        |
        v
 [3] Pages          components/*/..-page.tsx        read it with usePlannerData()
        |
        v
 [4] Helpers        lib/planner/*                   filter, sort, dates, money
```

Three rules:

1. To **read** data, a page calls `usePlannerData()`.
2. To **change** data, call a store function like `addTask()`. Never change data anywhere else.
3. Small components (cards, rows, buttons) just **show** what their parent gives them.

## 3. Pages (URL -> file)

| URL | `app/` file | Main component |
| --- | --- | --- |
| `/` | `app/page.tsx` | Sandbox index (links only) |
| `/calendar` | `app/calendar/page.tsx` | `CalendarPage` (calendar only) |
| `/todo` | `app/todo/page.tsx` | `TodoPage` (to-do list only) |
| `/contracts` | `app/contracts/page.tsx` | `ContractsPage` |
| `/contracts/new` | `app/contracts/new/page.tsx` | `ContractForm` |
| `/contracts/:id` | `app/contracts/[id]/page.tsx` | `ContractDetail` |
| `/events` | `app/events/page.tsx` | `EventsPage` |
| `/partners` | `app/partners/page.tsx` | `PartnersPage` |

Every page is wrapped by `app/layout.tsx`, which adds the `PlannerProvider` only. There is no shared header, menu or footer: each page is standalone and shows just a "Sandbox home" link (`SandboxPage`).
Each page file also wraps its component in `DataGate`, which shows "Loading" until the data is ready.

## 4. Which component shows which (tree)

```text
app/layout.tsx
├─ PlannerProvider ........ planner-provider.tsx   (uses the store + today's date)
└─ SandboxPage ............ sandbox-page.tsx      (just a "Sandbox home" link)
   └─ the page:

   "/calendar"  CalendarPage ... components/calendar/calendar-page.tsx
   ├─ FilterBar ........... filter-bar.tsx
   ├─ MonthHeader ......... month-header.tsx
   └─ MonthGrid ........... month-grid.tsx         (draws a DayCell for each day)

   "/todo"  TodoPage ......... components/todo/todo-page.tsx
   ├─ TaskItem ............ task-item.tsx
   └─ TaskFormDialog ...... task-form-dialog.tsx   (pop-up to add/edit a task)

   "/contracts"  ContractsPage ... components/contracts/contracts-page.tsx
   ├─ FilterBar (same one as the calendar)
   ├─ ContractCard ........ contract-card.tsx
   └─ ActivityList ........ activity-list.tsx

   "/contracts/new"  ContractForm ... contract-form.tsx

   "/contracts/:id"  ContractDetail . contract-detail.tsx
   ├─ ContractStatusBadge . (from contract-card.tsx)
   ├─ Checklist ........... (same file; payments and deliverables)
   └─ ActivityList

   "/events"  EventsPage ... components/events/events-page.tsx
   ├─ FilterBar (same one)
   ├─ EventSection ........ (same file; Upcoming / Past)
   └─ NewEventDialog -> NewEventForm

   "/partners"  PartnersPage ... components/partners/partners-page.tsx
```

`components/ui/*` are basic building blocks (button, input, dropdown, pop-up, checkbox, badge...) used everywhere.

## 5. What each file imports (cheat sheet)

Read as: *file -> files it uses*.

### Pages (`app/`)

| File | Uses |
| --- | --- |
| `layout.tsx` | `planner-provider` |
| every `page.tsx` | `planner-provider` (DataGate) + its main component (see section 3) |

### State and shell

| File | Uses |
| --- | --- |
| `hooks/use-planner-store.ts` | `lib/planner/dates`, `mock-data`, `mock-contracts`, `types` |
| `hooks/use-today.ts` | `lib/planner/dates`, `types` |
| `components/app-shell/planner-provider.tsx` | `use-planner-store`, `use-today`, `lookups`, `mock-data`, `types` |
| `components/sandbox/sandbox-page.tsx` | (none) |

### Calendar (`components/planner/`)

| File | Uses |
| --- | --- |
| `components/calendar/calendar-page.tsx` | `planner-provider`, `dates`, `selectors`, `types`, `filter-bar`, `month-header`, `month-grid` |
| `components/todo/todo-page.tsx` | `planner-provider`, `selectors`, `types`, `task-item`, `task-form-dialog` |
| `task-item.tsx` | `dates`, `selectors`, `types`, `lookups` |
| `month-grid.tsx` | `dates`, `selectors`, `types` |
| `month-header.tsx` | nothing from the app |
| `filter-bar.tsx` | `selectors`, `types` |
| `task-form-dialog.tsx` | `dates`, `types` |
| `lookups.ts` | `types` |

### Contracts, events, partners

| File | Uses |
| --- | --- |
| `contracts-page.tsx` | `planner-provider`, `filter-bar`, `lib/planner/contracts`, `types`, `activity-list`, `contract-card` |
| `contract-card.tsx` | `lib/planner/contracts`, `dates`, `types`, `lookups` |
| `contract-detail.tsx` | `planner-provider`, `contracts`, `dates`, `types`, `activity-list`, `contract-card` |
| `contract-form.tsx` | `planner-provider`, `contracts`, `dates`, `types` |
| `activity-list.tsx` | `lookups`, `types` |
| `events-page.tsx` | `planner-provider`, `filter-bar`, `contracts`, `dates`, `types` |
| `partners-page.tsx` | `planner-provider`, `contracts` |

### Helpers (`lib/`)

| File | What it does | Uses |
| --- | --- | --- |
| `types.ts` | Defines the shape of all the data | nothing |
| `dates.ts` | Date helpers ("Mar 7", "Tomorrow", month grid) | `types` |
| `selectors.ts` | Filter / sort tasks and events, count tasks per day | `dates`, `types` |
| `contracts.ts` | Money, due dates, filter / sort / group contracts | `dates`, `types` |
| `mock-data.ts` | Demo pillars, partners, staff, events, tasks | `dates`, `types` |
| `mock-contracts.ts` | Demo contracts and history | `dates`, `types` |
| `utils.ts` | `cn()` joins CSS class names | nothing |

## 6. The data (what links to what)

```text
Contract  -> has many payments       (PaymentInstalment)
          -> has many deliverables   (Deliverable)
          -> belongs to one Sponsor, and (optionally) one Event

Task      -> belongs to one staff member (assignee)
          -> optionally linked to an Event, a Sponsor, a Contract

Event     -> belongs to one Pillar
```

**Contracts and tasks stay in sync** (the code is in the reducer in `use-planner-store.ts`):

- Creating a contract creates a task for each unpaid payment and unfinished deliverable. That is how they show up on the calendar.
- Ticking the task ticks the payment/deliverable, and the other way round.
- Deleting a contract deletes its tasks.

## 7. "I want to change..." (where to look)

| I want to... | Go to |
| --- | --- |
| Add a page to the sandbox index | `PAGES` list in `app/page.tsx`, plus a new folder in `app/` |
| Change what data looks like | `lib/planner/types.ts` |
| Change how data is saved or edited | `hooks/use-planner-store.ts` |
| Use a real database later | Only `hooks/use-planner-store.ts` (keep the functions it returns the same) |
| Edit the demo data | `mock-data.ts`, `mock-contracts.ts` |
| Change the calendar's look or keyboard keys | `components/planner/month-grid.tsx` |
| Change how filtering works | `selectors.ts` (tasks, events), `lib/planner/contracts.ts` (contracts) |
| Add a field to the task form | `components/planner/task-form-dialog.tsx` (and `types.ts`) |
| Change the new-contract form | `components/contracts/contract-form.tsx` |
| Change how dates are written | `lib/planner/dates.ts` |
| Change colours, buttons, badges | `components/ui/*` and `app/globals.css` |

## 8. Tests

Run `npm test`. Tests sit next to the code they check (`*.test.ts`): `lib/planner/dates`, `selectors`, `contracts`, and the store's `reducer` in `hooks/use-planner-store.test.ts`. The reducer is exported so the contract <-> task sync can be tested without a browser.
