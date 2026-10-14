---
name: sync
description: Preflight check. Fetch remote, report branch health, ahead/behind counts and dirty files.
---

1. Run `git fetch`.
2. Run `git status -sb`, `git rev-list --left-right --count HEAD...origin/dev` (how far this branch is ahead of and behind `dev`), and `git rev-list --left-right --count HEAD...@{u}` if an upstream exists.
3. List uncommitted files (modified, staged, untracked).
4. Report a short summary: branch name, ahead/behind `dev`, ahead/behind its own remote, dirty files.
5. If behind `dev`, suggest `git merge origin/dev` (as in docs/TEAM_QUICKSTART.md). If behind its own remote, suggest `git pull`. Do not run either without asking.
