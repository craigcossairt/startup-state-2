# Domain docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root
- **`docs/briefs/goed-opportunity-finder.md`**, **`docs/primary-bounty.md`** for GOED Part 2 product context
- **`docs/decision-log.md`** for locked decisions (not live priorities)
- **`docs/adr/`** when it exists — read ADRs that touch the area you're about to work in

If any of these files don't exist, proceed silently for optional paths. `CONTEXT.md` and the briefs are required for Opportunity Finder work.

## File structure

Single-context repo:

```
/
├── CONTEXT.md
├── docs/
│   ├── briefs/
│   ├── decision-log.md
│   └── adr/                    (created lazily by domain-modeling)
└── src/                        App Router: Intake, Opportunity Map, leftover pages
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
