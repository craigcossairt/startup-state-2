# Bonus hang-off architecture

**Status: LOCKED** — HITL grilling. See [Bonus hang-off architecture](https://github.com/craigcossairt/startup-state-2/issues/19).

Every bonus is in the **build plan**. The list below is the **cut order** if the weekend clock runs out (last-to-first). Core never cuts: Intake, Opportunity Map, explain, history, five fixtures, honest case 5, brand, retrieve-then-LLM, at least two federal sources live.

Join keys stay on the Opportunity / Ranked card. Do not add bonus payloads to that record. Record: `docs/spec/shared-opportunity-record.md`.

Judged click path still does not open a bonus ([Judged demo walkthrough](https://github.com/craigcossairt/startup-state-2/issues/4)). That is the demo script, not a ban on shipping them.

## Grilling decisions

| # | Decision |
| --- | --- |
| Q1 | Build all bonuses if time. Table is the cut list, not a never-build list. |
| Q2 | Extra federal adapters: as many **official public APIs** as time allows after the core four. Same retrieve-then-rank. No scrape. Not every agency. |
| Q3 | Weekend UI **omits** greyed “coming soon” chips. Nav stays Startup State + GOEO + Opportunity Map. |

## Cut last-to-first

Drop from the top if time runs out.

| Order | Bonus | If it ships | Hangs off |
| --- | --- | --- | --- |
| 1 (cut first) | Opportunity graph | Nodes = Opportunities. Edges = same `agency` or same `aln`. Not a geo map. | `id`, `agency`, `aln` |
| 2 | Agency map | Group the current Ranked cards by `agency.name`. Not a geo map. | `agency` |
| 3 | Follow-up chat | Helper over the current Ranked card + Company profile. Grounded: no invented programs. | Ranked card + profile |
| 4 | Alerts | Watch `id` + `deadline`. Delivery later (email). | `id`, `deadline` |
| 5 | Similar-companies surface | **Already ships** as on-card `similarAwardees`. A separate page is the cuttable extra. | `similarAwardees` |
| 6 | 12-month strategy | Ordered subset of this map’s Ranked cards by deadline / standing. | Ranked card[] + profile |
| 7 | Application checklist | Steps from `nextStep` + official url. | Ranked card + profile |
| 8 | Extra federal sources | More retrieve adapters. Same Opportunity `id` shape (`{source}:{nativeId}`). | new `source` + `id` |
| 9 (cut last) | Welcome-back | Restore last Company profile in the session. | session / profile |

On-card history (USAspending / SBIR CSV attach) is **core**, not this cut list.

## Extra federal sources (Q2)

Core four stay required: Grants.gov search2 (open list), SAM Assistance Listings (join, cached), USAspending (history), SBIR award CSV (history).

If time after core:

1. **SAM Contract Opportunities** (`GET https://api.sam.gov/opportunities/v2/search`). Official procurement notices. Same personal API key and 10/day no-Role cap. First extra adapter. Source slug: `sam_opps`.
2. Further official first-party APIs only (for example Challenge.gov if a public API is confirmed at build time). Same record, same rank rule (retrieved IDs only).

Do not scrape. Do not ingest the entire federal government. Do not add HigherGov or other commercial aggregators.

## UI

No disabled bonus nav. If a bonus ships, it appears as a real control. If it does not, it is absent.

## What this spec is not

- The app.
- Exact infer / rank / explain prompt text (locked: `docs/spec/infer-rank-explain-prompts.md`).
- Pixel look ([Visual end state for Intake and Opportunity Map](https://github.com/craigcossairt/startup-state-2/issues/18)).
