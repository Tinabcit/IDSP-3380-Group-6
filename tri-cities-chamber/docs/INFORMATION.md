# Information: how this project's docs and commands work

Start here. Part 1 says what each doc is for. Part 2 points to the commands. Part 3 and 4 cover safety and keeping docs current.

## Part 1 — What each file is for

| File | Question it answers | How it changes | Who reads it |
| --- | --- | --- | --- |
| `docs/DISCOVERY.md` | Why are we building this? What hurts, what is success, what limits do we have? | Written up front, revised when the client says something new | `/phase` |
| `docs/USER_RESEARCH.md` | What do real users say? | Grows as interviews happen | `/phase` |
| `docs/COMPETITIVE_MATRIX.md` | What do people use today, and where is it weak? | Updated as you learn about alternatives | `/phase` |
| `docs/DECISIONS.md` | What did we choose while building, and why? | Append-only, never cleared | `/phase` |
| `docs/IMPLEMENTATION_PLAN.md` | What are we building next? | Holds the reconstructed history (Phases 1-3) plus the current phase. `/phase` adds one phase at a time. Finished phases may later move to `docs/archive/` | `/phase`, `/done`, `/landed` |

Other files you will meet:

| File | Purpose |
| --- | --- |
| `CLAUDE.md` | Short rules the AI reads before every task (process, security, code style) |
| `AGENTS.md` | Next.js version warning. Managed by `next dev`, do not edit |
| `docs/TEAM_QUICKSTART.md` | One page for teammates: the command table, which doc to touch |
| `ARCHITECTURE.md` | Where code lives and how it connects |
| `README.md` | What the app is, how to run it |
| `.claude/skills/*/SKILL.md` | The four commands: `/sync`, `/phase`, `/done`, `/landed` |
| `.claude/agents/*.md` | Helper agents. Core: code-quality-validator, test-coverage-validator, pr-writer, code-reviewer, docs-updater. Optional: security-auditor, refactoring-specialist, acceptance-criteria-validator. Ask Claude to "use the <name> agent" |
| `../.github/pull_request_template.md` | PR checklist: tests, docs updated, plan ticked, decision logged |
| `tri-cities-chamber/.claude/settings.json` | Permissions: allow, ask and deny lists (blocks sudo, recursive deletes, force pushes, pushes to `dev`/`main`, reading `.env`) |
| `../.claude/settings.json` (repo root) | Shared plugins only. Currently just `typescript-lsp` |
| `.claude/settings.local.json` | Your personal settings and extra plugins. Gitignored, never committed |

Rule of thumb: how the code is built goes in `DECISIONS.md`. What the client or users need goes in `DISCOVERY.md` or `USER_RESEARCH.md`.

Why the app is in `tri-cities-chamber/`: the repo root also holds `.github/`, `sandbox/` and a root `.claude/settings.json`. As the Claude Code docs describe it, skills load from the folder you launch Claude Code in, so open `tri-cities-chamber/` (not the repo root). We have only confirmed this in our own sessions.

## Part 2 — Commands for every new branch

The command table lives in one place: [`TEAM_QUICKSTART.md`](TEAM_QUICKSTART.md). Branch off `dev`, name it `features/<name>`, and open a PR into `dev`.

How much `/done` does depends on size:

| Scope | Signal | What happens |
| --- | --- | --- |
| Quick | Small change, no plan items tied to this branch | Validate, commit, PR into `dev`, check CI. No code review |
| Standard | Medium change, no plan items tied to this branch | Quick, plus wait on CI and run the code-reviewer agent |
| Project | This branch has plan items | Standard, plus handoff note and ticking the plan items it finished |

All scopes run lint, build and tests, and none pushes before you confirm.

## Part 3 — Safety reminders

- Read each permission prompt and each diff.
- Permission tiers. We stay at Tier 1 or 2.

| Tier | Mode | What it does |
| --- | --- | --- |
| 1 | Manual | Asks before every action |
| 2 | Edit Automatically | Edits and runs commands freely, except what the deny list blocks (and the ask list prompts for) |
| 3 | Auto | Acts with little or no asking. Not used by this team |

- Never use sudo or admin rights. Be wary of `rm`, `chmod` or paths outside this folder.
- Never commit `.env` files, keys or tokens.
- Dev server: `npm run dev`.

## Part 4 — Keeping the docs current

- Every PR updates the docs it affects. `/done` does this with the docs-updater agent, and the PR template makes a person confirm it.
- Only tick plan items your own PR finished. Add a `DECISIONS.md` entry in the same PR as the choice.
- `DECISIONS.md`, `DISCOVERY.md`, `USER_RESEARCH.md` and `COMPETITIVE_MATRIX.md` are written by people, not generated.
- Review `IMPLEMENTATION_PLAN.md` once a week and run `/phase` to add the next phase when the current one is finished.
