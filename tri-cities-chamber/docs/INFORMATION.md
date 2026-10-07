# Information: how this project's docs and commands work

Start here. Part 1 says what each doc is for. Part 2 says which command to run, and when, on every new branch.

## Part 1 — What each file is for

| File | Question it answers | How it changes | Who reads it |
| --- | --- | --- | --- |
| `docs/DISCOVERY.md` | Why are we building this? What hurts, what is success, what limits do we have? | Written up front, revised when the client says something new | `/plan` |
| `docs/USER_RESEARCH.md` | What do real users say? | Grows as interviews happen | `/plan` |
| `docs/COMPETITIVE_MATRIX.md` | What do people use today, and where is it weak? | Updated as you learn about alternatives | `/plan` |
| `docs/DECISIONS.md` | What did we choose while building, and why? | Append-only, never cleared | `/plan` |
| `docs/IMPLEMENTATION_PLAN.md` | What are we building next? | Short-lived, one phase at a time, reset per feature | `/plan`, `/done`, `/landed` |

Other files you will meet:

| File | Purpose |
| --- | --- |
| `CLAUDE.md` | Short rules the AI reads before every task (process, security, code style) |
| `AGENTS.md` | Next.js version warning. Managed by `next dev`, do not edit |
| `docs/TEAM_QUICKSTART.md` | One page for teammates: which command to run when, which doc to touch |
| `ARCHITECTURE.md` | Where code lives and how it connects |
| `README.md` | What the app is, how to run it |
| `.claude/skills/*/SKILL.md` | The four commands below |
| `.claude/agents/*.md` | Helper agents. Core: code-quality-validator, test-coverage-validator, pr-writer, code-reviewer, docs-updater. Optional: security-auditor, refactoring-specialist, acceptance-criteria-validator. Ask Claude to "use the <name> agent" |
| `../.github/pull_request_template.md` | PR checklist: tests, docs updated, plan ticked, decision logged |
| `.claude/settings.json` | Permission allow/deny lists (blocks sudo, force push, reading `.env`) |

Rule of thumb: how the code is built goes in `DECISIONS.md`. What the client or users need goes in `DISCOVERY.md` or `USER_RESEARCH.md`.

## Part 2 — Commands for every new branch

Run from the `tri-cities-chamber/` folder (the VS Code terminal). Branch off `dev`.

| Step | Command | Type it in | What it does |
| --- | --- | --- | --- |
| 1 | `git checkout dev` then `git pull` | terminal | Start from the latest `dev` |
| 2 | `git checkout -b features/<name>` | terminal | Make your branch |
| 3 | `/sync` | Claude | Preflight: fetch, ahead/behind, dirty files |
| 4 | `/plan` | Claude | Reads `docs/`, asks questions, writes the next phase to `IMPLEMENTATION_PLAN.md`, logs decisions to `DECISIONS.md` |
| 5 | Build with TDD: write a failing test, make it pass, clean up. Commit often | Claude + terminal | Git is your safety net |
| 6 | `npm run lint` and `npm run build` and `npm test` | terminal | Check before finishing (`/done` also runs these) |
| 7 | `/done` | Claude | Validates, updates the docs (docs-updater agent, plus a `DECISIONS.md` entry if you made a design choice), commits, opens a PR to `dev` using the PR template, checks CI, asks for review, adds a changelog entry. Checks off plan items |
| 8 | Teammate reviews and merges the PR on GitHub | GitHub | |
| 9 | `/landed` | Claude | Confirms `dev` builds and CI passes, deletes the merged branch |

Only the `git` and `npm` rows are typed in the terminal. The `/` commands are typed into Claude Code.

How much `/done` does depends on size:

| Scope | Signal | What happens |
| --- | --- | --- |
| Quick | Small change on `dev` | Validate, commit, push, check CI |
| Standard | Feature branch, medium change | Validate, commit, PR, CI, code review, changelog |
| Project | Unchecked plan items exist | Standard, plus handoff note and updated plan |

## Part 3 — Safety reminders

- Read each permission prompt and each diff. Stay at permission Tier 1 or 2.
- Never use sudo or admin rights. Be wary of `rm`, `chmod` or paths outside this folder.
- Never commit `.env` files, keys or tokens.
- Dev server: `npm run dev`.

## Part 4 — Keeping the docs current

- Every PR updates the docs it affects. `/done` does this with the docs-updater agent, and the PR template makes a person confirm it.
- Only tick plan items your own PR finished. Add a `DECISIONS.md` entry in the same PR as the choice.
- `DECISIONS.md`, `DISCOVERY.md`, `USER_RESEARCH.md` and `COMPETITIVE_MATRIX.md` are written by people, not generated.
- Review `IMPLEMENTATION_PLAN.md` once a week and run `/plan` to add the next phase when the current one is finished.
