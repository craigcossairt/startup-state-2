# Company profile schema

**Status: LOCKED** — HITL grilling complete (rounds 1–3). See [Company profile schema](https://github.com/craigcossairt/startup-state-2/issues/8).

Spec for the Company profile object used by Intake, infer, retrieve, rank, and the five official fixtures. Not the Part 1 six-field Persona.

## Grilling decisions

### Round 1 (field categories)

- **Must-have (infer or ask):** what they do, tech, location (country + state), employees, revenue, capital raised, capital need, use of funds.
- **Infer-if-present (never block):** stage, R&D intensity, product maturity, customers.
- **Not Part 1 Persona.** Some fields are binary; others are fuzzy ranges.

### Round 2 (types and semantics)

| # | Decision |
| --- | --- |
| Q1 | Every field uses `ProfileField<T>` with `known` / `inferred` / `missing`. |
| Q2 | Both `technologies` (open strings) and `sectors` (enum chips) are must-have. |
| Q3 | `hqCountry` + `hqState` must-have; `hqCity` infer-if-present (display / color, not match gate). |
| Q4 | `revenue` = single point amount + basis (`arr` \| `annual_revenue`). |
| Q5 | `capitalNeedUsd` always a range; point target = `minUsd === maxUsd`. |
| Q6 | Explicit **confirm** screen for inferred must-haves before map; no silent promotion. |
| Q7 | Fixture cities are **real** Utah municipalities (see fixture table). |
| Q8 | Schema supports any US `hqState`; weekend demo uses Utah fixtures + optional live non-UT Intake. |

### Round 3 (Intake widgets and enums)

| # | Decision |
| --- | --- |
| Q9 | `capitalRaisedUsd` = equity + convertibles to date. No debt, no grants. |
| Q10 | Employee Intake: **exact number** primary; optional band chips set `min === max` (midpoint or top of band). |
| Q11 | `SectorTag` and `UseOfFundsTag` **frozen for the weekend**; extend only if a fixture needs a missing tag (same PR updates spec). |
| Q12 | Fixture switcher labels: brief-aligned short names (see fixture table). Case 5 hints honest-no. |

## Design rules

1. **Must-have for rank** — Infer first from free text or fixture click. Intake asks only must-have fields still `missing` after infer. Opportunity Map runs only after confirm step clears all inferred must-haves and all must-haves are `known`.
2. **Enrichment optional** — Infer-if-present fields never block the map.
3. **Fit, not eligible** — Profile describes the company; it does not assert grant eligibility.
4. **Ranges are fuzzy** — Dollar and headcount ranges use min/max. Matching overlap rules live on [Retrieve and probably-not floor](https://github.com/craigcossairt/startup-state-2/issues/2).
5. **Utah is data** — `hqState` and `operatesInUtah` feed State-lane rules; Federal lane ignores Utah residency on the card.

## TypeScript reference

```typescript
/** USD whole dollars unless noted. */
type UsdAmount = number;

type UsdRange = {
  minUsd: UsdAmount;
  maxUsd: UsdAmount;
};

type IntRange = {
  min: number;
  max: number;
};

type FieldStatus = "known" | "inferred" | "missing";

type ProfileField<T> = {
  status: FieldStatus;
  value?: T;
  /** 0–1 when status is inferred; omit when known or missing. */
  confidence?: number;
  /** Shown on confirm step when inferred from ambiguous text. */
  note?: string;
};

export type RevenueBasis = "arr" | "annual_revenue" | "unknown";

export type CompanyStage =
  | "pre_revenue"
  | "early_revenue"
  | "growth"
  | "scale";

export type RdIntensity = "none" | "some" | "core";

export type ProductMaturity =
  | "idea"
  | "prototype"
  | "beta"
  | "production";

export type CustomerType =
  | "b2b"
  | "b2c"
  | "b2g"
  | "hospitals"
  | "municipalities"
  | "defense"
  | "consumers"
  | "parents"
  | "youth";

export type SectorTag =
  | "healthcare"
  | "ai"
  | "saas"
  | "aerospace"
  | "manufacturing"
  | "defense"
  | "water"
  | "climate"
  | "environment"
  | "infrastructure"
  | "cybersecurity"
  | "marketplace"
  | "education"
  | "youth"
  | "workforce";

export type UseOfFundsTag =
  | "product_development"
  | "pilots"
  | "scale_up"
  | "r_and_d"
  | "hiring"
  | "equipment"
  | "expansion"
  | "commercial_growth"
  | "manufacturing_scale";

export type CompanyProfile = {
  fixtureId?: "fixture-1" | "fixture-2" | "fixture-3" | "fixture-4" | "fixture-5";

  /** Must-have */
  whatTheyDo: ProfileField<string>;
  technologies: ProfileField<string[]>;
  sectors: ProfileField<SectorTag[]>;
  hqCountry: ProfileField<string>;
  hqState: ProfileField<string>;
  employeeCount: ProfileField<IntRange>;
  revenue: ProfileField<{ basis: RevenueBasis; amountUsd: UsdAmount }>;
  capitalRaisedUsd: ProfileField<UsdAmount>;
  capitalNeedUsd: ProfileField<UsdRange>;
  useOfFunds: ProfileField<UseOfFundsTag[]>;
  useOfFundsNotes: ProfileField<string>;

  /** Infer-if-present — never block Intake or map */
  hqCity: ProfileField<string>;
  stage: ProfileField<CompanyStage>;
  rdIntensity: ProfileField<RdIntensity>;
  productMaturity: ProfileField<ProductMaturity>;
  customerTypes: ProfileField<CustomerType[]>;

  /** Derived at infer; not asked in Intake */
  operatesInUtah: ProfileField<boolean>;
};
```

## Field reference

| Field | Type | Must-have | Missing means | Notes |
| --- | --- | --- | --- | --- |
| `whatTheyDo` | free text | yes | Intake asks one clarifying sentence | Primary infer input; 1–3 sentences in UI |
| `technologies` | string[] | yes | Intake asks "what tech?" | Open vocabulary, normalized lowercase |
| `sectors` | `SectorTag[]` | yes | Intake asks sector chips | Closed enum for retrieve; multi-select |
| `hqCountry` | string | yes | Intake asks country | Default infer `US` when US signals present |
| `hqState` | 2-letter US state | yes | Intake asks state | Any US state allowed (Q8) |
| `hqCity` | string | no | stays missing | Infer-if-present; real city when set; display only |
| `employeeCount` | `IntRange` | yes | Intake asks headcount | Exact number primary; band chips optional (Q10). Point: `min === max` |
| `revenue` | basis + USD point | yes | Intake asks revenue | `arr` when ARR stated; else `annual_revenue` |
| `capitalRaisedUsd` | USD point | yes | Intake asks total raised | Equity + convertibles only; no debt or grants (Q9) |
| `capitalNeedUsd` | `UsdRange` | yes | Intake asks funding target | Always a range; non-dilutive search target |
| `useOfFunds` | `UseOfFundsTag[]` | yes | Intake asks use chips | Multi-select |
| `useOfFundsNotes` | free text | no | stays missing | Color on use of funds |
| `stage` | enum | no | stays missing | Infer from revenue / employees / text |
| `rdIntensity` | enum | no | stays missing | |
| `productMaturity` | enum | no | stays missing | |
| `customerTypes` | enum[] | no | stays missing | |
| `operatesInUtah` | boolean | no | derived | `true` when `hqState === "UT"` |

### `FieldStatus` semantics

| Status | Meaning | Intake behavior |
| --- | --- | --- |
| `known` | User typed, fixture loaded, or user confirmed on confirm step | Filled |
| `inferred` | Model filled; user has not confirmed | Shown on confirm screen |
| `missing` | Not inferable | Prompt for must-have |

**Confirm step (Q6):** After infer, if any must-have is `inferred`, show one screen listing those fields (editable). User taps Continue on that screen → all shown fields become `known`. No auto-promotion without passing confirm.

### Range matching (for retrieve ticket)

Scoring weights and overlap rules live on [Retrieve and probably-not floor](https://github.com/craigcossairt/startup-state-2/issues/2) / `docs/spec/retrieve-and-rank.md`.

## Official fixtures

All five are Utah-headquartered per the brief. Cities are real Utah municipalities (Q7).

| Fixture | Switcher label (Q12) | Brief case | City (real) |
| --- | --- | --- | --- |
| fixture-1 | Healthcare AI | AI healthcare SaaS | Salt Lake City |
| fixture-2 | Aerospace | Aerospace manufacturing | Ogden |
| fixture-3 | Water / climate | Water / climate sensors + AI | Provo |
| fixture-4 | Cyber | Cyber threat detection | Lehi |
| fixture-5 | Youth marketplace (honest-no) | Parent / youth marketplace | Salt Lake City |

### fixture-1 — AI healthcare SaaS

```json
{
  "fixtureId": "fixture-1",
  "whatTheyDo": { "status": "known", "value": "AI healthcare SaaS reducing administrative burden on nurses" },
  "technologies": { "status": "known", "value": ["ai", "saas", "healthcare software"] },
  "sectors": { "status": "known", "value": ["healthcare", "ai", "saas"] },
  "hqCountry": { "status": "known", "value": "US" },
  "hqState": { "status": "known", "value": "UT" },
  "hqCity": { "status": "known", "value": "Salt Lake City" },
  "employeeCount": { "status": "known", "value": { "min": 15, "max": 15 } },
  "revenue": { "status": "known", "value": { "basis": "arr", "amountUsd": 1000000 } },
  "capitalRaisedUsd": { "status": "known", "value": 2500000 },
  "capitalNeedUsd": { "status": "known", "value": { "minUsd": 500000, "maxUsd": 2000000 } },
  "useOfFunds": { "status": "known", "value": ["product_development", "pilots"] },
  "useOfFundsNotes": { "status": "known", "value": "Product development and hospital pilots" },
  "stage": { "status": "known", "value": "growth" },
  "rdIntensity": { "status": "known", "value": "core" },
  "productMaturity": { "status": "known", "value": "production" },
  "customerTypes": { "status": "known", "value": ["hospitals", "b2b"] },
  "operatesInUtah": { "status": "known", "value": true }
}
```

### fixture-2 — Aerospace manufacturing

```json
{
  "fixtureId": "fixture-2",
  "whatTheyDo": { "status": "known", "value": "Aerospace manufacturing and advanced components" },
  "technologies": { "status": "known", "value": ["manufacturing", "aerospace"] },
  "sectors": { "status": "known", "value": ["aerospace", "manufacturing", "defense"] },
  "hqCountry": { "status": "known", "value": "US" },
  "hqState": { "status": "known", "value": "UT" },
  "hqCity": { "status": "known", "value": "Ogden" },
  "employeeCount": { "status": "known", "value": { "min": 35, "max": 35 } },
  "revenue": { "status": "known", "value": { "basis": "annual_revenue", "amountUsd": 3000000 } },
  "capitalRaisedUsd": { "status": "known", "value": 8000000 },
  "capitalNeedUsd": { "status": "known", "value": { "minUsd": 2000000, "maxUsd": 5000000 } },
  "useOfFunds": { "status": "known", "value": ["scale_up", "r_and_d", "manufacturing_scale"] },
  "useOfFundsNotes": { "status": "known", "value": "Manufacturing scale-up and R&D" },
  "stage": { "status": "known", "value": "scale" },
  "rdIntensity": { "status": "known", "value": "core" },
  "productMaturity": { "status": "known", "value": "production" },
  "customerTypes": { "status": "known", "value": ["defense", "b2b"] },
  "operatesInUtah": { "status": "known", "value": true }
}
```

### fixture-3 — Water / climate sensors + AI

```json
{
  "fixtureId": "fixture-3",
  "whatTheyDo": { "status": "known", "value": "Water and climate monitoring sensors with AI analytics" },
  "technologies": { "status": "known", "value": ["sensors", "ai", "iot"] },
  "sectors": { "status": "known", "value": ["water", "climate", "environment", "infrastructure", "ai"] },
  "hqCountry": { "status": "known", "value": "US" },
  "hqState": { "status": "known", "value": "UT" },
  "hqCity": { "status": "known", "value": "Provo" },
  "employeeCount": { "status": "known", "value": { "min": 10, "max": 10 } },
  "revenue": { "status": "known", "value": { "basis": "annual_revenue", "amountUsd": 500000 } },
  "capitalRaisedUsd": { "status": "known", "value": 1500000 },
  "capitalNeedUsd": { "status": "known", "value": { "minUsd": 500000, "maxUsd": 3000000 } },
  "useOfFunds": { "status": "known", "value": ["product_development", "pilots"] },
  "useOfFundsNotes": { "status": "known", "value": "Product development and municipal pilots" },
  "stage": { "status": "known", "value": "early_revenue" },
  "rdIntensity": { "status": "known", "value": "core" },
  "productMaturity": { "status": "known", "value": "beta" },
  "customerTypes": { "status": "known", "value": ["municipalities", "b2g"] },
  "operatesInUtah": { "status": "known", "value": true }
}
```

### fixture-4 — Cyber threat detection

```json
{
  "fixtureId": "fixture-4",
  "whatTheyDo": { "status": "known", "value": "Cyber threat detection for enterprises and government" },
  "technologies": { "status": "known", "value": ["cybersecurity", "saas"] },
  "sectors": { "status": "known", "value": ["cybersecurity", "defense", "saas"] },
  "hqCountry": { "status": "known", "value": "US" },
  "hqState": { "status": "known", "value": "UT" },
  "hqCity": { "status": "known", "value": "Lehi" },
  "employeeCount": { "status": "known", "value": { "min": 22, "max": 22 } },
  "revenue": { "status": "known", "value": { "basis": "arr", "amountUsd": 2000000 } },
  "capitalRaisedUsd": { "status": "known", "value": 5000000 },
  "capitalNeedUsd": { "status": "known", "value": { "minUsd": 1000000, "maxUsd": 3000000 } },
  "useOfFunds": { "status": "known", "value": ["r_and_d", "commercial_growth"] },
  "useOfFundsNotes": { "status": "known", "value": "R&D and federal/commercial growth" },
  "stage": { "status": "known", "value": "growth" },
  "rdIntensity": { "status": "known", "value": "core" },
  "productMaturity": { "status": "known", "value": "production" },
  "customerTypes": { "status": "known", "value": ["b2b", "b2g", "defense"] },
  "operatesInUtah": { "status": "known", "value": true }
}
```

### fixture-5 — Parent / youth marketplace (honest-no case)

```json
{
  "fixtureId": "fixture-5",
  "whatTheyDo": { "status": "known", "value": "Marketplace connecting parents with youth activities and programs" },
  "technologies": { "status": "known", "value": ["marketplace", "mobile"] },
  "sectors": { "status": "known", "value": ["marketplace", "education", "youth"] },
  "hqCountry": { "status": "known", "value": "US" },
  "hqState": { "status": "known", "value": "UT" },
  "hqCity": { "status": "known", "value": "Salt Lake City" },
  "employeeCount": { "status": "known", "value": { "min": 8, "max": 8 } },
  "revenue": { "status": "known", "value": { "basis": "annual_revenue", "amountUsd": 750000 } },
  "capitalRaisedUsd": { "status": "known", "value": 1000000 },
  "capitalNeedUsd": { "status": "known", "value": { "minUsd": 250000, "maxUsd": 1000000 } },
  "useOfFunds": { "status": "known", "value": ["expansion", "commercial_growth"] },
  "useOfFundsNotes": { "status": "known", "value": "Geographic and category expansion" },
  "stage": { "status": "known", "value": "early_revenue" },
  "rdIntensity": { "status": "known", "value": "some" },
  "productMaturity": { "status": "known", "value": "production" },
  "customerTypes": { "status": "known", "value": ["parents", "youth", "b2c"] },
  "operatesInUtah": { "status": "known", "value": true }
}
```

Store runtime copies under `data/fixtures/company-profile.fixture-*.json` when the app exists.

## Intake flow binding

1. User sentence or fixture click (fixtures load all fields as `known`).
2. **Infer** (Grok 4.6, structured `CompanyProfile`).
3. **Confirm** — if any must-have is `inferred`, one screen; user edits or accepts → all become `known`.
4. **Ask** — any must-have still `missing` (chips + short text). Employee: number field plus optional bands (1–10, 11–50, 51–250, 251+).
5. **Map** — all must-haves `known`; enrichments optional.

## Enum policy (Q11)

`SectorTag`, `UseOfFundsTag`, `CustomerType`, `CompanyStage`, `RdIntensity`, and `ProductMaturity` are frozen for the weekend POC. Add a tag only when a fixture or retrieve path requires it; update this spec in the same change.

## What this schema is not

- Not Part 1 `Persona` (six fields, topic weights).
- Not an eligibility checklist.
- Not a persisted user account (session / fixture only for the weekend POC).
