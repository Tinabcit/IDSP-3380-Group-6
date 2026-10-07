---
name: landed
description: Post-merge verification. Confirm CI on dev and delete the merged feature branch.
---

1. Switch to `dev` and pull the latest.
2. Confirm CI passes on `dev` (`gh run list --branch dev --limit 1`) and `npm run build` succeeds.
3. Delete the merged local and remote feature branch, after confirming with the user.
4. If every item in docs/IMPLEMENTATION_PLAN.md is checked, offer to archive or clear it. Never clear DECISIONS.md.
5. Report a short confirmation summary.
