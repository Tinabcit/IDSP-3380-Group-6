---
name: sync
description: Preflight check. Fetch remote, report branch health, ahead/behind counts and dirty files.
---

1. Run `git fetch`.
2. Run `git status -sb`, and `git rev-list --left-right --count HEAD...@{u}` if an upstream exists.
3. List uncommitted files (modified, staged, untracked).
4. Report a short summary: branch name, ahead/behind counts, dirty files.
5. If behind, suggest `git pull --rebase`. Do not run it without asking.
