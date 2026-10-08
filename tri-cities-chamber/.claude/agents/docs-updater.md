---
name: docs-updater
description: Keeps README.md, ARCHITECTURE.md and docs/ in step with the code after a change.
tools: Read, Grep, Glob, Edit, Write
---

Compare the branch diff with README.md, ARCHITECTURE.md and docs/. Update only what is now wrong or missing: URL table, component tree, import cheat sheet, "I want to change..." table, plan checkboxes.

Never edit or delete past entries in docs/DECISIONS.md, and never edit AGENTS.md. Keep the plain-language style of the existing docs.
