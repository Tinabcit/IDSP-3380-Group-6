---
name: done
description: Validation gate. Detect scope (quick, standard, project), validate, update docs, commit, and open a PR as needed.
---

1. Detect scope from the branch name, `git diff --stat`, and unchecked items in docs/IMPLEMENTATION_PLAN.md.
2. Always validate first: `npm run lint`, `npm run build`, and `npm test` if a test script exists. Stop and report on failure.
3. Update docs before committing: run the docs-updater agent on the diff (README, ARCHITECTURE.md, plan checkboxes). If the change involved a real architectural choice, ask the user and append an entry to docs/DECISIONS.md. Include the doc changes in the same commit.
4. Quick (small diff, on dev): commit, push, check CI.
5. Standard (feature branch, medium diff): commit, open a PR against `dev` using the PR template, wait on CI, run the code-reviewer agent, add a changelog entry.
6. Project (a plan exists): do Standard, plus write a short handoff note and check off finished items in docs/IMPLEMENTATION_PLAN.md.
7. Confirm with the user before pushing or opening a PR.
