# Intake and Opportunity Map look

**Status: LOCKED (structure only)** — HITL prototype + grilling. See [Intake and Opportunity Map look](https://github.com/craigcossairt/startup-state-2/issues/9).

How Intake and the ranked Opportunity Map are arranged. Not pixel polish. Visual end state arrived as the 2026-08-15 Claude Design zip (Intake + Opportunity Map). This file still owns structure and locked copy. The zip is not pixel law for retrieve, rank, or Fit.

Throwaway probe (not the look spec): `docs/prototypes/intake-and-map-look.html` on branch `prototype/intake-and-map-look`.

Related: `docs/spec/company-profile-schema.md`, `docs/spec/retrieve-and-rank.md`, `docs/spec/shared-opportunity-record.md`.

## Grilling decisions

| # | Decision |
| --- | --- |
| Q1 | Spine is the **editorial stack** (prototype variant A): midnight hero, one sentence, fixtures, then a column of Ranked cards. |
| Q2 | Test cases stay on Intake and as a visible fixture rail on the map so judges can flip companies without a new infer. Leave one-card focus (variant C) out of the weekend default. |
| Q3 | Default map uses **full Ranked cards** (why, concerns, history, next step). Not compact rows. |
| Q4 | Case-5 **probably-not floor** is a green notice above the list (`Read this first` + locked sentence), federal `probably not` cards still listed under it. |
| Q5 | This ticket locks **structure**. The HTML is a layout probe, not the end-state look. |

## Surfaces

```
Nav (Startup State + GOED; leftover surfaces stay; /map label is Opportunities)
        ↓
Intake  — landing hero + founder card + five fixture chips
        ↓  (fixture click skips confirm; sentence goes confirm then map)
Confirm — inferred must-haves, editable (Q6 on the profile spec)
        ↓
Opportunity Map
  ├─ You bar (leftover persona; not a ranking input)
  ├─ Midnight company hero + facts strip
  ├─ Fixture rail (visible; not only inside Company profile)
  ├─ Retrieve / Fit sidebar (retrieve is draft until Rank again)
  ├─ Probably-not notice when the floor trips
  └─ Full Ranked cards, 8–12, array order = rank
```

## Intake

- Hero line: **Tell us about your company.**
- One sentence field. Primary action: infer, then confirm if any must-have is inferred.
- Fixture chips use the locked labels: Healthcare AI, Aerospace, Water / climate, Cyber, Youth marketplace (honest-no).
- Fixture click loads the typed fixture as `known` and goes straight to the map.
- Copy is fit, never eligible.

## Opportunity Map

- Same page family as Intake (not a second site). Source badge Federal or Utah.
- Test cases stay reachable from Intake and from the fixture rail on the map. You bar leftover persona is not a ranking input.
- Retrieve sidebar: Lane (Federal / Utah), six GOEO keys, `directory`. Those changes stay draft until Rank again. Fit checkboxes only filter the ranked list and apply at once.
- Each Ranked card shows, in this order: Source badge, instrument, status, Fit, program, agency, value, deadline, why, concerns, similar awardees, next step.
- Value or deadline `null` displays as **Not published**. Do not invent a number or a date.
- Empty `similarAwardees` is allowed; say none attached, do not invent firms.

## Probably-not floor (case 5)

Green notice above the list, user-facing, no em dash:

> Traditional federal grants look like a poor fit for this company. Utah programs below are the stronger place to start.

Utah cards lead. One to three Federal `probably not` cards stay under the banner with why / concerns. Do not hide them. Do not invent a strong federal grant.

## Nav

Startup State wordmark + GOED. Product item label is **Opportunities** (`/map`). Leftover surfaces stay on the nav.

## What this spec is not

- Pixel-level visual end state (the 2026-08-15 Claude Design zip is the look source; it is not retrieve or Fit law).
- Exact infer / rank / explain prompt text (locked: `docs/spec/infer-rank-explain-prompts.md`).
- Which curated Utah cards exist (locked: `docs/spec/utah-state-lane-mix.md`).
- The judged click path (locked: `docs/spec/judged-demo-walkthrough.md`). Not a required speech.
