# Shared opportunity record

**Status: LOCKED** — HITL grilling rounds 1–2 complete. See [Shared opportunity record](https://github.com/craigcossairt/startup-state-2/issues/3).

The catalog Opportunity and the company-specific Ranked card that the Opportunity Map, history, and later bonuses hang off. Company profile: `docs/spec/company-profile-schema.md`. Retrieve pipeline: `docs/spec/retrieve-and-rank.md`.

Language: `CONTEXT.md`.

## Grilling decisions

### Round 1 (grain and split)

| # | Decision |
| --- | --- |
| Q1 | One listing, one Opportunity. Do not collapse a program (NSF Seed Fund) across FOAs. |
| Q2 | Split catalog Opportunity from Ranked card. Fit, why, concerns, next step, and history live only on the Ranked card. |
| Q3 | Instrument enum is independent of the Federal / Utah Source badge. |
| Q4 | Bonuses get join keys only (`id`, `agency`, `deadline`, `aln`, `url`). No graph edges, checklist, alerts, or chat on this record. Similar-companies is the on-card history list. Welcome-back is session. |

### Round 2 (shape)

| # | Decision |
| --- | --- |
| Q5 | `id` is `{source}:{nativeId}`. Grants.gov uses search2 integer `id`. GOEO uses WP `external_id`. Curated uses a slug. |
| Q6 | Opportunity fields locked below. `curated` is on `OpportunitySource` now so [Utah State-lane mix](https://github.com/craigcossairt/startup-state-2/issues/13) does not change this record. Lane is stored, not derived. |
| Q7 | Ranked card **embeds** the Opportunity. Array order is rank order. No numeric score. |
| Q8 | History attachment fields locked below. Empty `similarAwardees` is allowed. |
| Q9 | Missing value or deadline is `null`. Do not invent a range or a date. Display copy belongs on [Intake and Opportunity Map look](https://github.com/craigcossairt/startup-state-2/issues/9). |

## Why the split

An earlier catalog flattened a directory row and a score onto one `ScoredResource`. Alerts, a graph, and a 12-month list need a listing that still exists when the Company profile changes. Fit does not. Two types keep the weekend map as one JSON list and leave a stable id for later bonuses.

## TypeScript reference

```typescript
type OpportunitySource = "grants_gov" | "goeo" | "curated";

type Instrument =
  | "grant"
  | "loan"
  | "incentive"
  | "counseling"
  | "contracting_help"
  | "procurement"
  | "other";

type OpportunityStatus = "posted" | "forecasted" | "standing";

type FitLabel = "likely" | "potential-verify" | "adjacent" | "probably_not";

type Opportunity = {
  id: `${OpportunitySource}:${string}`;
  source: OpportunitySource;
  nativeId: string;
  opportunityNumber?: string;
  lane: "federal" | "state";
  jurisdiction: "UT" | null;
  instrument: Instrument;
  status: OpportunityStatus;
  program: string;
  agency: { name: string; code?: string };
  value: { minUsd: number; maxUsd: number } | null;
  deadline: string | null;
  url: string | null;
  aln: string[];
  description: string | null;
  applicantTypes?: string[];
  applicantNote?: string;
};

type HistoryAttachment = {
  source: "usaspending" | "sbir_csv";
  name: string;
  amountUsd?: number;
  year?: number;
  state?: string;
  city?: string;
  summary?: string;
  url?: string;
};

type RankedCard = {
  opportunity: Opportunity;
  fit: FitLabel;
  why: string;
  concerns: string[];
  nextStep: { label: string; url?: string };
  similarAwardees: HistoryAttachment[];
};
```

Display `probably_not` as "probably not".

The Opportunity Map payload is `RankedCard[]`. Length 8–12 on the default view (`docs/spec/retrieve-and-rank.md`).

## Identity (Q5)

| Source | `id` example | `nativeId` | Also store |
| --- | --- | --- | --- |
| Grants.gov search2 | `grants_gov:359671` | integer `id` (required by `fetchOpportunity`) | `opportunityNumber` (`PA-27-100`) as display, not the id |
| GOEO table | `goeo:2543` | WP export `external_id` (unique on all 213 in the committed snapshot) | — |
| Curated official card | `curated:nucleus-utif` | slug we assign | — |

Adapters mint `id` as `` `${source}:${nativeId}` ``. Rank may only emit these ids. Server drops any rank id that is not in the retrieved set.

## Opportunity field notes

| Field | Rule |
| --- | --- |
| `source` | Adapter that retrieved the listing. `curated` is reserved for official cards locked on [Utah State-lane mix](https://github.com/craigcossairt/startup-state-2/issues/13). |
| `lane` | Stored, not derived. Grants.gov → `federal`. GOEO and curated Utah cards → `state`. A future curated federal card still fits. |
| `jurisdiction` | `UT` on State-lane rows. `null` on Federal. |
| `instrument` | Weekend enum is frozen. Grants.gov adapter maps `fundingInstruments`. GOEO / curated set per row. Badge stays Federal / Utah. |
| `status` | Grants.gov `posted` or `forecasted`. GOEO and curated standing programs → `standing`. |
| `value` | USD range, or `null` when search2 has no ceiling, detail is `"none"`, or the State-lane row has no number. |
| `deadline` | ISO date, or `null` when unknown (empty forecast close date, standing program). |
| `aln` | CFDA / ALN strings from Grants.gov `cfdaList` / `alnist`. Empty on most State-lane rows. SAM join key. |
| `applicantTypes` / `applicantNote` | Retrieve facts for rank (Grants.gov codes and text). Not Fit. Never labeled eligible. |

Source badge on the card is Federal when `lane === "federal"`, else Utah (this demo's Jurisdiction).

## Ranked card

Embed the Opportunity. Do not send id-only cards that need a second lookup to render.

| Field | Rule |
| --- | --- |
| `fit` | `likely` / `potential-verify` / `adjacent` / `probably_not`. Rank assigns this. Never "eligible." |
| `why` | One string. Rank writes it. |
| `concerns` | Zero or more strings. Rank writes them from profile vs listing, including `applicantNote`. |
| `nextStep` | Label plus optional url. Prefer retrieve `url` / `assistURL` when present. |
| `similarAwardees` | History attachments after rank. Prefer Utah recipients when Company profile `hqState` is `UT`. Empty array is fine. |

No score field. Weekend rank is qualitative. List order is rank order.

## History attachment

USAspending and the SBIR award CSV attach here. They are not retrieve ids and not their own Opportunity.

This list **is** the similar-companies surface. Do not add a second model for it.

## Bonus join keys (Q4)

Later surfaces hang off these fields. They do not add payloads to this record.

| Surface | Hangs off |
| --- | --- |
| Agency map | `opportunity.agency` |
| Opportunity graph | `opportunity.id` (nodes); grouping by `agency` or `aln` later |
| Alerts | `opportunity.id` + `deadline` |
| Application checklist | Ranked card + Company profile |
| 12-month strategy | Ranked card[] + Company profile |
| Follow-up chat | Ranked card + Company profile |
| Similar-companies | `similarAwardees` |
| Welcome-back | Session / Company profile, not this record |

## What this spec is not

- Exact infer / rank / explain prompt text (locked: `docs/spec/infer-rank-explain-prompts.md`).
- Which curated Utah cards exist (locked: `docs/spec/utah-state-lane-mix.md`).
- How Intake and the map look (structure locked: `docs/spec/intake-and-map-look.md`). Visual end state is a later ticket.
- Graph edge types, alert delivery, checklist contents, 12-month generation, or chat as a helper (locked: `docs/spec/bonus-hang-off.md`).
