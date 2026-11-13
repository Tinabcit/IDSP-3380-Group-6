# Tri-Cities Chamber: Contracts, Events and Reminders (MVP)

MVP built from the Sept. 28 client meet and greet. Data is stored in a
Supabase (Postgres) database through Prisma and Next.js server actions.

## Run

Needs Node 22.12 or newer (Vitest 5 does not run on Node 20).

```bash
npm install
npm run dev
npm test        # unit tests (Vitest)
npm run lint
npm run build
```

### Database setup (Supabase)

1. In the Supabase SQL editor run `supabase/migrations/0001_match_app_fields.sql` (safe to run again).
2. In Supabase open Connect > ORMs > Prisma and copy the two connection strings into `.env.local` as `DATABASE_URL` (pooled, port 6543) and `DIRECT_URL` (port 5432). Set both on Vercel too.
3. `npm install` generates the Prisma client (`npm run db:generate` does it again after editing `prisma/schema.prisma`).
4. Seed it:
   - `npm run db:seed` (same as `npx prisma db seed`) adds the four pillars plus the demo partners, events, contracts, tasks and staff. Run it again any time to reset the demo rows to fresh dates; it never duplicates them and leaves rows people added alone. The demo rows are visible to everyone using that database.
   - For a real database without demo data, run `supabase/seed.sql` in the SQL editor instead. It adds only the four pillars.

The tables are managed in Supabase. Do not run `prisma migrate dev` against it; put changes in a new file in `supabase/migrations/`.

### Google sign-in setup

The landing page (`/`) signs people in with Google (Auth.js). Copy `.env.example` to `.env.local` and fill it in:

1. Run `npx auth secret` and paste the value as `AUTH_SECRET`.
2. In Google Cloud Console go to APIs & Services, Credentials, Create credentials, OAuth client ID (Web application).
3. Add the authorized redirect URI `http://localhost:3000/api/auth/callback/google` (and your Vercel URL with the same path).
4. Paste the client ID and secret as `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`. On Vercel, set all three as environment variables.

Never commit `.env.local`. Without these values the app builds, but sign-in will not work and app pages redirect to `/`.

## What the client asked for, and where it is

| Client need (rating)                          | In the MVP                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| Effortless contract entry (5)                 | `/contracts/new`: upload (simulated auto-fill) or short manual form; payments and deliverables become calendar reminders automatically |
| Easy navigation for short-term interns (5)    | Four-item nav: bottom tab bar on phones, top bar on desktop; global "Signed in as" switcher |
| Sorting by event, pillar or partner           | `/contracts`: group by event / pillar / partner, sort by next due, value, partner, title, plus search |
| Signature event filter                        | Filter bar on Calendar, Contracts and Events                               |
| Calendar and reminders (not more e-blasts)    | `/`: month calendar with a month / year picker, overdue / to-do markers, "Coming up" list, bell toasts for tasks due in 1-2 days, header bell for overdue           |
| Events on the calendar                        | Add, edit and delete events (start / end time, description, category) from the Events page or the calendar day panel; deleting an event unlinks its tasks and contracts |
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
components/events/         events page + shared add / edit event dialog
components/partners/       partners page + add / edit sponsor pop up
components/planner/        calendar and task components
components/ui/             shadcn/ui primitives
hooks/use-planner-store.ts events, tasks, partners, contracts, activity; saves to the database
hooks/planner-reducer.ts   the pure reducer that applies every change
lib/db/                    actions.ts (server actions), planner-repo.ts (queries), mappers.ts, prisma.ts,
                           demo-seed.ts (what npm run db:seed writes)
prisma/seed.ts             the seed command
prisma/schema.prisma       the database tables as Prisma models
supabase/                  SQL migration and seed to run in Supabase
lib/planner/
  types.ts                 domain types (flat, id-referenced, DB-ready)
  ids.ts                   UUIDs for new rows
  mock-data.ts             demo pillars, partners, staff, events, tasks (seed + tests)
  mock-contracts.ts        demo contracts and history (seed + tests)
  contracts.ts             filter, sort, group, totals, demo summary and extraction
  events.ts                event categories, times, sorting and form checks
  sponsors.ts              sponsor levels, default to do list, form checks
  selectors.ts, dates.ts   task selectors and date helpers
```

Contract payments and deliverables are mirrored as tasks (linked by
`contractItemId`). Ticking one side updates the other.

## How data is saved

Pages only talk to `usePlannerData()`, which wraps `usePlannerStore()`. A change
runs through the reducer first (so the screen updates straight away), then the
store calls a server action in `lib/db/actions.ts` to save it. If a save fails,
the store reloads from the database and shows an error toast. Tables:
`events`, `tasks`, `sponsors` (+ `sponsor_todos`), `sponsor_agreements`
(contracts, + `agreement_payments`, `agreement_deliverables`), `activity_log`,
`pillars`, `profiles` (staff; made automatically on first sign-in).

## Docs and AI workflow

New teammates: read `docs/TEAM_QUICKSTART.md` (one page). For the full picture, see `docs/INFORMATION.md`: what each doc is for, and the commands to run
on every new branch (`/sync`, `/phase`, `/done`, `/landed`). Rules for the AI
assistant are in `CLAUDE.md`. Decisions are logged in `docs/DECISIONS.md` and
the current plan is in `docs/IMPLEMENTATION_PLAN.md`. `ARCHITECTURE.md` explains
how the files connect.
