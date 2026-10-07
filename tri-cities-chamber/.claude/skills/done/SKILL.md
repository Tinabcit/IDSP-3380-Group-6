---
name: done
description: Validation gate. Detect scope (quick, standard, project), validate, commit, and open a PR as needed.
---

1. Detect scope from the branch name, `git diff --stat`, and unchecked items in docs/IMPLEMENTATION_PLAN.md.
2. Always validate first: `npm run lint`, `npm run build`, and `npm test` if a test script exists. Stop and report on failure.
3. Quick (small diff, on dev): commit, push, check CI.
4. Standard (feature branch, medium diff): commit, open a PR against `dev`, wait on CI, run the code-reviewer agent, add a changelog entry.
5. Project (a plan exists): do Standard, plus write a short handoff note and check off finished items in docs/IMPLEMENTATION_PLAN.md.
6. Confirm with the user before pushing or opening a PR.
