---
name: phase
description: Phase planning. Read docs/, ask questions, update IMPLEMENTATION_PLAN.md and log decisions in DECISIONS.md.
---

1. Read everything in docs/ and ARCHITECTURE.md, especially DECISIONS.md and IMPLEMENTATION_PLAN.md.
2. Ask clarifying questions if the feature is ambiguous.
3. Update docs/IMPLEMENTATION_PLAN.md with the next phase only, as ordered `- [ ]` steps grouped logically (data layer, store, UI). Each behaviour step starts with its test (TDD).
4. Append each real architectural decision to docs/DECISIONS.md as `## YYYY-MM-DD — title` with Context, Decision, Alternatives considered. Never edit or delete old entries.
5. Do not write application code in this step.
