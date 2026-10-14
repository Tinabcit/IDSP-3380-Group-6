## Summary

What changed and why (2-4 bullets).

## Changelog

1-3 user-facing lines (what a teammate or the client would notice). Merged PRs into `dev` are the project changelog.

## Checks

- [ ] `npm run lint`, `npm run build` and `npm test` pass
- [ ] New behaviour has a test (written first)
- [ ] Docs updated if code changed: `README.md`, `ARCHITECTURE.md` (run `/done`, which uses the docs-updater agent)
- [ ] `docs/IMPLEMENTATION_PLAN.md`: only the items this PR finished are ticked
- [ ] `docs/DECISIONS.md`: new entry added if an architectural choice was made (or "none" here)
- [ ] No `.env`, keys or tokens committed
