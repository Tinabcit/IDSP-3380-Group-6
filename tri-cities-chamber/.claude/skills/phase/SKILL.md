---
name: phase
description: Phase planning. Read docs/, ask questions, update IMPLEMENTATION_PLAN.md and log decisions in DECISIONS.md.
---

1. Read everything in docs/ and ARCHITECTURE.md, especially DECISIONS.md and IMPLEMENTATION_PLAN.md.
2. Ask clarifying questions if the feature is ambiguous.
3. Update docs/IMPLEMENTATION_PLAN.md with one new phase per feature asked for, as ordered `- [ ]` steps grouped logically (data layer, store, UI). Each behaviour step starts with its test (TDD). Do not add a "merge this branch" step. Other open phases may exist; leave them alone. Under the phase heading, write `Branch: <name>`: the current branch from `git branch --show-current` if this branch will do the work, otherwise ask the user for the intended features/<name> and owner (always ask if on dev or main). Never invent a branch name for older phases.
4. Append each real architectural decision to docs/DECISIONS.md as `## YYYY-MM-DD — title` with Context, Decision, Alternatives considered. Never edit or delete old entries.
5. Do not write application code in this step.
