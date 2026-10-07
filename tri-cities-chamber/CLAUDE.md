@AGENTS.md

## Development Process

Enforce TDD workflow. Use /sync (preflight), /plan (design plan), /done (validate), /landed (post-merge).

Refer to docs/DECISIONS.md and docs/IMPLEMENTATION_PLAN.md for context before work.

Background: docs/DISCOVERY.md, docs/USER_RESEARCH.md, docs/COMPETITIVE_MATRIX.md, ARCHITECTURE.md. What each doc is for: docs/INFORMATION.md.

Dev server: npm run dev. Lint: npm run lint. Build: npm run build. Tests: npm test (Vitest, *.test.ts next to the code).

Agents live in .claude/agents (code-reviewer, test-coverage-validator, pr-writer, docs-updater, security-auditor, ...).

## Architecture rules (see ARCHITECTURE.md)

- Read data with usePlannerData(); change it only through store functions in hooks/use-planner-store.ts.
- Small components only show what their parent passes in.
- Pure logic goes in lib/planner/*, so it is easy to test.
- Frontend-only MVP with mock data. Do not add a backend unless a DECISIONS.md entry says so.

## Security

- Runtime: work only inside this project folder; never use sudo or admin rights.
- Scanning: use security-auditor agent for OWASP checks.
- Secrets: never commit .env, keys, or tokens (use .env.local).

## Code Style

- Types: required (TypeScript, strict mode).
- Components: functional components + hooks only.
- Comments: plain-language comment on every function, matching the existing files.
- Formatting: no special Unicode in code/output.
