---
name: done
description: Validation gate. Detect scope (quick, standard, project), validate, update docs, commit, and open a PR into dev.
---

1. Run `git branch --show-current`. If it is `dev` or `main`, stop and tell the user: work happens on a `features/<name>` branch and reaches `dev` through a PR.
2. Detect scope from the branch name, `git diff --stat dev...HEAD`, and the items in docs/IMPLEMENTATION_PLAN.md that this branch works on (not unrelated unchecked items):
   - Quick: small diff, no plan items tied to this branch.
   - Standard: medium diff, no plan items tied to this branch.
   - Project: this branch has plan items it finishes or starts.
3. Always validate, never skip: run `npm run lint`, `npm run build` and `npm test`, then use the code-quality-validator agent. Stop and report on any failure.
4. Docs: run the docs-updater agent on the diff (README, ARCHITECTURE.md, plan checkboxes). Quick runs it only if the diff touches docs or changes pages, components or data shapes. If the change involved a real architectural choice, ask the user and append an entry to docs/DECISIONS.md. Commit doc changes with the work.
5. Show the user the diff stat, the commit message and the PR draft (use the pr-writer agent). Ask for confirmation before any push or PR. Nothing is pushed before that.
6. After confirmation: commit, push the feature branch, and open a PR against `dev` using .github/pull_request_template.md. Never push to `dev` or `main`.
7. Quick: stop after the PR is open and CI is checked (`gh pr checks`). No code-reviewer agent.
8. Standard: also wait on CI and run the code-reviewer agent on the diff. Report its findings.
9. Project: do Standard, plus write a short handoff note (what is done, what is next, open questions) in the PR description, and check off only the plan items this branch finished.
