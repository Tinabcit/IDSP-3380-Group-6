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

## 2026-10-20 — Home page is one component; calendar moves to /calendar

Context: Phase 7 asks for the TuDu home page from the Figma screenshot. The team plans to build many separate components later and merge them into one.

Decision: The whole home page (sidebar, filters, task table, pagination) is one component, components/home/home-page.tsx, with only small local helpers inside it; the pure logic lives in lib/planner/home.ts. It replaces "/", so the calendar moves to "/calendar" and the menu gains a Home link. The header bell links now point to /calendar. The sidebar uses real data: Repeat = signature events, One-off = other events, Archived = finished events. The data has no partner levels yet, so all partners sit under Pillar Partners and Annual / Program stay empty.

Alternatives considered: A new /home route next to the calendar (rejected: the design is the home page). Replacing AppShell with the sidebar (rejected: other pages still need the header and menu). Splitting into many files now (rejected: the team wants one component).

## 2026-10-26 — Sponsor pop up lives on /partners; Save is a draft, Publish is active

Context: Phase 8 asks for the Sponsor Information pop up from docs/sponsorPopUp.png. /partners is the only page that lists sponsors. The app has no backend, so "Publish" has no server meaning.

Decision: The pop up is components/partners/sponsor-form-dialog.tsx, opened from /partners with "New sponsor" and a per-card "Edit". Sponsor gains optional website, level, notes, status and todos (no localStorage key bump). Save stores the sponsor with status "draft" (shown with a Draft badge); Publish stores it as "active". The To Do List is a todos array on the sponsor, not calendar Tasks, so it needs no due date or assignee. A store action updateSponsor was added.

Alternatives considered: Publish identical to Save (rejected: the button would do nothing). Creating real Task records for the to do list (rejected: they require a due date and assignee the mockup does not collect).

## 2026-11-01 — Landing page at "/", Google sign-in with Auth.js, theme by class

Context: Phase 9 asks for the landing page from docs/landingPage.png with Sign Up, Login and a Theme menu. The team wants Google sign-in to validate people. This overrides the earlier "frontend-only, no backend" rule for sign-in only.

Decision: The landing page is "/" (route group app/(landing)); the task table home page moved to "/home" and every other app page sits in the app/(app) group, which alone gets AppShell. Sign-in uses next-auth v5 (Auth.js) with the Google provider and JWT sessions; there is no database. Google has no separate sign-up, so Sign Up and Login run the same flow. proxy.ts redirects signed-out visitors of app pages to "/". Secrets live only in .env.local (.env.example lists the names). Theme uses a "dark" class on <html>, set before paint from localStorage; "Default" follows the computer. Dependencies added: next-auth, @radix-ui/react-dropdown-menu. The planner data and the "Signed in as" demo user switcher are unchanged; linking Google accounts to planner users is not done. A type error in components/dashboard/cardInfo.tsx (already failing the build on main) was fixed so the build passes. AppShell is wrapped in Suspense because the sidebar reads the URL.

Alternatives considered: Landing at /landing (rejected: "/" is the front door). Buttons only, no route protection (rejected: sign-in would not validate anything). A hand-built theme dropdown (rejected: shadcn was requested).

## 2026-11-03 — Add Event is a full page at /events/new with a simulated PDF upload

Context: Phase 10 asks for the Add Event screens in docs/Events (upload card, required fields, sidebar button). Events were only added through a modal, and there is no file storage.

Decision: Adding an event is the page /events/new (the modal EventFormDialog stays for editing). All seven fields are required and show "Field Required" (validateEventForm in lib/planner/events.ts). Sponsor is free text with suggestions from existing sponsors, stored as sponsorName on the event. The PDF upload is simulated: a timer fakes progress, non-PDF or over 10 MB files fail, and only the file name is saved (state machine in lib/planner/upload.ts). The Figma has no pillar field, so new events use the first pillar. The duplicate Add event / Add task buttons were removed from the calendar day panel; the page header pair stays. Work branched from main because dev was 12 commits behind it.

Alternatives considered: Keep the modal (rejected: does not match the design). Pick sponsors from a dropdown only (rejected: new sponsors could not be typed).

## 2026-11-08 — Sidebar avatar footer reads the Google session on the server

Context: Phase 11 adds the shadcn-style avatar footer from docs/AvatarIcon.png. Nothing on the client knew who signed in with Google; the old "Signed in as" select is the planner staff switcher.

Decision: app/(app)/layout.tsx reads the session with auth() (after connection()) and passes a DisplayUser (getDisplayUser in lib/planner/user.ts) down by props to AppShell, AppSidebar and UserMenu. No SessionProvider. Without a session it shows "Unknown user" / "unknown@...". The staff switcher stays. Added @radix-ui/react-avatar and shadcn Avatar, plus DropdownMenuItem/Label/Separator. Sign in/out server actions live in components/app-shell/auth-actions.ts.

Alternatives considered: SessionProvider with useSession (rejected: extra client state, props are simpler). Replacing the staff switcher (rejected: it drives planner data).
