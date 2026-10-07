# Team Quickstart

One page for teammates. Do these steps on every branch and the docs stay up to date. Details are in `INFORMATION.md`.

## One-time setup

1. Open the `tri-cities-chamber/` folder in VS Code (File > Open Folder), not the repo root.
2. Run Claude Code from the VS Code terminal in that folder.
3. `npm install`
4. Check the commands exist: type `/` in Claude Code and look for `sync`, `plan`, `done`, `landed`.

## Every branch: what to run

| When | Command | Where | What you get |
| --- | --- | --- | --- |
| Start | `git checkout dev`, `git pull`, `git checkout -b features/<name>` | terminal | A fresh branch from the latest `dev` |
| Start | `/sync` | Claude | Branch health and dirty files |
| Before coding | `/plan` | Claude | Reads the docs, asks questions, writes the next phase into `IMPLEMENTATION_PLAN.md`, logs design choices in `DECISIONS.md` |
| While coding | Write a failing test first, then the code, then clean up | Claude + terminal | Tests in `*.test.ts` next to the code |
| Finished | `/done` | Claude | Lint, build, tests, then updates README / ARCHITECTURE / plan boxes, asks about a `DECISIONS.md` entry, commits, opens the PR |
| After merge | `/landed` | Claude | Checks `dev` builds, deletes your branch |

Quick checks any time: `npm test`, `npm run lint`, `npm run build`.

## Which doc do I touch?

| If your PR... | Update |
| --- | --- |
| Adds or changes a page, component or data shape | `README.md`, `ARCHITECTURE.md` (`/done` does this) |
| Finishes planned work | Tick only your own boxes in `IMPLEMENTATION_PLAN.md` |
| Makes a design choice (library, data shape, where logic lives) | Add an entry to the end of `DECISIONS.md` |
| Learns something from the client or users | `DISCOVERY.md` or `USER_RESEARCH.md` |
| Finds a competitor or substitute | `COMPETITIVE_MATRIX.md` |

## Rules that avoid conflicts

- Never edit or delete old entries in `DECISIONS.md`. Only add to the end.
- Do not edit `AGENTS.md`. If it shows as modified, run `git checkout AGENTS.md`.
- Do not commit `.env` files or keys.
- Do not reformat shared files such as `package.json` or the docs.
- Changes to `.claude/skills` or `.claude/agents` go through a PR like code.
- If `dev` moved while you worked: `git fetch`, then `git merge origin/dev`, fix conflicts, `npm install`, `npm test`.
- Keep personal Claude settings in `.claude/settings.local.json`, not `settings.json`.

## Stuck?

- `/sync` shows where your branch stands.
- A command is missing: you opened the wrong folder. Reopen `tri-cities-chamber/`.
- A PR check fails: run `npm run lint`, `npm run build` and `npm test` and read the first error.
