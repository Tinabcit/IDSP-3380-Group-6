---
name: landed
description: Post-merge verification. Confirm dev builds and passes tests, and delete the merged feature branch.
---

1. Switch to `dev` and pull the latest.
2. Run `npm install`, `npm run build` and `npm test` on `dev`. If the repo has CI, also confirm the latest run passed (`gh run list --branch dev --limit 1`); if it has none, say so.
3. Delete the merged local and remote feature branch, after confirming with the user.
4. If every phase in docs/IMPLEMENTATION_PLAN.md is fully checked, offer to move the finished phases to docs/archive/ (through a PR, like any change). Never delete phases or their `Branch:` lines, and leave the Backlog in place. Never clear DECISIONS.md.
5. Report a short confirmation summary.
