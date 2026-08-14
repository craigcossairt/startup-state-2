# Intake and Opportunity Map look

**Status: LOCKED (structure only)** — HITL prototype + grilling. See [Intake and Opportunity Map look](https://github.com/craigcossairt/startup-state-2/issues/9).

How Intake and the ranked Opportunity Map are arranged. Not pixel polish. Visual end state (type, color, card anatomy, density) waits on a Figma or Claude Design handoff.

Throwaway probe (not the look spec): `docs/prototypes/intake-and-map-look.html` on branch `prototype/intake-and-map-look`.

Related: `docs/spec/company-profile-schema.md`, `docs/spec/retrieve-and-rank.md`, `docs/spec/shared-opportunity-record.md`.

## Grilling decisions

| # | Decision |
| --- | --- |
| Q1 | Spine is the **editorial stack** (prototype variant A): midnight hero, one sentence, fixtures, then a column of Ranked cards. |
| Q2 | Steal the **fixture rail on the map** from variant B so judges can flip companies without going back to Intake. Leave one-card focus (variant C) out of the weekend default. |
| Q3 | Default map uses **full Ranked cards** (why, concerns, history, next step). Not compact rows. |
| Q4 | Case-5 **probably-not floor** is a midnight banner above the list, locked copy, federal `probably not` cards still listed under it. |
| Q5 | This ticket locks **structure**. The HTML is a layout probe, not the end-state look. |

## Surfaces

```
Nav (Startup State + GOEO only; no Playbook / geo map / Careers / Swag / News)
        ↓
Intake  — one sentence + five fixture chips
        ↓  (fixture click skips confirm; sentence goes confirm then map)
Confirm — inferred must-haves, editable (Q6 on the profile spec)
        ↓
Opportunity Map
  ├─ Fixture rail (always visible; official five)
  ├─ Probably-not banner when the floor trips
  ├─ Chips (lane, GOEO keys, directory, Fit)
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
- Fixture rail stays on the map.
- Chips: Lane (Federal / Utah), six GOEO keys, `directory`, Fit. Lane / keys / directory re-retrieve; Fit only filters the ranked list.
- Each Ranked card shows, in this order: Source badge, Fit, instrument (secondary), program, agency, value, deadline, why, concerns, similar awardees, next step.
- Value or deadline `null` displays as **Not published**. Do not invent a number or a date.
- Empty `similarAwardees` is allowed; say none attached, do not invent firms.

## Probably-not floor (case 5)

Banner above the list, user-facing, no em dash:

> Traditional federal grants look like a poor fit for this company. Utah programs below are the stronger place to start.

Utah cards lead. One to three Federal `probably not` cards stay under the banner with why / concerns. Do not hide them. Do not invent a strong federal grant.

## Nav

Startup State wordmark + GOEO. One product item: Opportunity Map. Do not bring over Playbook, Startups map, Careers, Swag, or News.

## What this spec is not

- Pixel-level visual end state (Figma / Claude Design handoff; see the follow-on ticket).
- Exact infer / rank / explain prompt text.
- Which curated Utah cards exist (locked: `docs/spec/utah-state-lane-mix.md`).
- The judged click path (locked: `docs/spec/judged-demo-walkthrough.md`). Not a required speech.
