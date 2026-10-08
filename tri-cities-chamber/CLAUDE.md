@AGENTS.md

## Development Process

- TDD: red (write a failing test first), green (smallest code to pass), refactor (clean up, re-run).
- Commands: /sync (preflight), /phase (plan the next phase), /done (validate and open PR), /landed (post-merge).
- Never commit to dev or main. Branch from dev as features/<name>, open a PR into dev, a teammate reviews it.
- Read docs/DECISIONS.md and docs/IMPLEMENTATION_PLAN.md before work. Docs map: docs/INFORMATION.md.
- DECISIONS.md is append-only: add a dated entry, never edit or delete old ones.
- Do not edit AGENTS.md (next dev rewrites it).
- Ask before adding dependencies or changing shared config (package.json, .claude/*).
- Dev server: npm run dev. Lint: npm run lint. Build: npm run build. Tests: npm test (Vitest, *.test.ts next to the code).
- Core agents in .claude/agents: code-quality-validator, test-coverage-validator, pr-writer, code-reviewer, docs-updater. Optional: security-auditor, refactoring-specialist, acceptance-criteria-validator.

## Architecture rules (see ARCHITECTURE.md)

- Read data with usePlannerData(); change it only through store functions in hooks/use-planner-store.ts.
- Small components only show what their parent passes in.
- Pure logic goes in lib/planner/*, so it is easy to test.
- Frontend-only MVP with mock data. Do not add a backend unless a DECISIONS.md entry says so.

## Security

- Runtime: work only inside this project folder; never use sudo or admin rights.
- Scanning: for OWASP checks, the optional security-auditor agent can help.
- Secrets: never commit .env, keys, or tokens (use .env.local).

## Code Style

- Types: required (TypeScript, strict mode).
- Components: functional components + hooks only.
- Comments: plain-language comment on every function, matching the existing files.
- Formatting: no special Unicode in code/output.
