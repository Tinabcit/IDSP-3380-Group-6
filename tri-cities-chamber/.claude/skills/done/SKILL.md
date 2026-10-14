---
name: done
description: Validation gate. Detect scope (quick, standard, project), validate, update docs, commit, and open a PR into dev.
---

1. Run `git branch --show-current`. If it is `dev` or `main`, stop and tell the user: work happens on a `features/<name>` branch and reaches `dev` through a PR.
2. Detect scope from the branch name, `git diff --stat dev...HEAD`, and the phase in docs/IMPLEMENTATION_PLAN.md whose `Branch:` line matches the current branch (ignore unchecked items in other phases):
   - Quick: small diff, no phase tied to this branch.
   - Standard: medium diff, no phase tied to this branch.
   - Project: a phase has a `Branch:` line matching this branch.
3. Always validate, never skip: run `npm run lint`, `npm run build` and `npm test`, then use the code-quality-validator and test-coverage-validator agents. Stop and report on any failure.
4. Docs: run the docs-updater agent on the diff (README, ARCHITECTURE.md, plan checkboxes). Tell it the current branch: it may tick boxes only in the phase whose `Branch:` line matches, and none in Quick or Standard. Quick runs it only if the diff touches docs or changes pages, components or data shapes. If the change involved a real architectural choice, ask the user and append an entry to docs/DECISIONS.md. Commit doc changes with the work.
5. Show the user the diff stat, the commit message and the PR draft (use the pr-writer agent). Ask for confirmation before any push or PR. Nothing is pushed before that.
6. After confirmation: commit, push the feature branch by name (`git push -u origin <branch>`), and open a PR against `dev` using ../.github/pull_request_template.md (the template is at the repo root). If a PR from this branch is already open, update its description instead. Never push to `dev` or `main`.
7. Quick: stop after the PR is open and CI is checked (`gh pr checks`). If it reports no checks, the repo has no CI yet: say so, and rely on the local checks from step 3. No code-reviewer agent.
8. Standard: also wait on CI if there is any, and run the code-reviewer agent on the diff. Report its findings. Fill the PR's Changelog section (1-3 user-facing lines); merged PRs into `dev` are the changelog.
9. Project: do Standard, plus write a short handoff note (what is done, what is next, open questions) in the PR description, and check off only the plan items this branch finished.
