# Reusing Part 1 startup-state

Part 1 live demo: https://startup-state-opal.vercel.app
Part 1 repo: https://github.com/craigcossairt/startup-state
Local clone (read-only source): `C:\Users\Craig Cossairt\startup-state`

## Verdict

**New product, old skin and old intake.** Do not fork last year's five-surface app. Recommend **federal and Utah on the same Opportunity Map.** Steal brand, layout, infer, reason chips, and the test-case switcher so the POC looks like it could ship on startup.utah.gov today.

Federal discovery is the required core. Utah is the brief's stated optional advantage.

## Product shape

One intake. One map. Two sources on every card.

```
"Tell us about your company"
        ↓
Government Opportunity Map
  ├── Federal  — grants, SBIR/STTR, assistance listings, procurement
  └── Utah     — GOEO programs that help you pursue that federal money
                 or that are the honest answer when federal is a poor fit
```

Utah is not a second website and not the 19-step Playbook. Same ranked list, **Federal / Utah** badge, same why/verify/next-step block, tight catalog (Funding + government-contract help, not all 213 rows).

Test case 5 is where this pays off: **probably no strong federal grant**, here are the Utah programs that still help.

## What to extract

| Piece | Where it lives in Part 1 | Why |
|---|---|---|
| Brand tokens | `src/app/globals.css` | Vibrant Green, Midnight, off-white |
| Wordmark / logos | `Startup State - Logos/` | Looks like their site |
| Type | Mulish + Source Sans + Source Serif | Editorial heroes |
| Nav + footer | `src/components/nav.tsx`, `footer.tsx` | Strip Playbook/Map/Careers/Swag/News |
| Cards, pills, buttons | `src/components/ui/` + resource cards | On-brand |
| Infer from one sentence | `src/app/api/playbook/infer-persona` | New schema (ARR, raised, R&D, use of funds, tech) |
| Reason chips | `src/lib/matching.ts` UX, not topic weights | "Why this" |
| Test-case switcher | persona bar / quick-pick | Five official companies, including "say no" |
| Utah catalog subset | `resources` seed | Innovation Center, APEX, Funding-tagged next steps |
| Grounding rule | chat system prompt | Never invent a program |

## What not to extract

- `/playbook` and the 19 steps as the hero
- Mapbox geo map, claims, audit, careers, swag, news
- `GOAL_TOPICS` / `STAGE_TOPICS` weights
- Chat topic-lock that hides SBIR unless asked
- The six Part 1 personas as the judged set

## Build order

1. Next.js app with the stolen tokens, type, nav, cards.
2. Intake + five fixtures + Opportunity Map shell.
3. Two federal sources + explain + history. Prove all five test cases, including honest "no."
4. Utah lane: same cards, source badge, companion or fallback programs.
