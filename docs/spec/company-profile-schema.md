# Company profile schema

**Status: DRAFT** — round 1 grilling locked the field *categories* (must-have vs infer-if-present). Rounds 2+ still open on types, enums, missing semantics, and fixture payloads. Do not treat as locked until [Company profile schema](https://github.com/craigcossairt/startup-state-2/issues/8) closes after HITL.

Working draft for the Company profile object used by Intake, infer, retrieve, rank, and the five official fixtures. Not the Part 1 six-field Persona.

## Design rules

1. **Must-have for rank** — Infer first from free text or fixture click. Intake asks only fields still `missing` after infer. Opportunity Map does not run until every must-have field is `known` or `inferred` with user confirmation.
2. **Enrichment optional** — Infer-if-present fields never block the map. Rank and explain may use them when present.
3. **Fit, not eligible** — Profile fields describe the company. They do not assert grant eligibility.
4. **Ranges are fuzzy** — Dollar and headcount ranges use min/max USD or integers. Matching treats overlap as partial fit, not a hard gate.
5. **Utah is data, not a lane name** — Location fields feed State-lane rules. `hqState` and inferred Utah presence drive Utah program fit; Federal lane ignores Utah residency requirements on the card.

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
  /** Short note when inferred from ambiguous text (shown in Intake confirm step). */
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
  /** Set when loaded from an official fixture; omit for live Intake. */
  fixtureId?: "fixture-1" | "fixture-2" | "fixture-3" | "fixture-4" | "fixture-5";

  /** Must-have */
  whatTheyDo: ProfileField<string>;
  technologies: ProfileField<string[]>;
  sectors: ProfileField<SectorTag[]>;
  hqCountry: ProfileField<string>;
  hqState: ProfileField<string>;
  hqCity: ProfileField<string>;
  employeeCount: ProfileField<IntRange>;
  revenue: ProfileField<{ basis: RevenueBasis; amountUsd: UsdAmount }>;
  capitalRaisedUsd: ProfileField<UsdAmount>;
  capitalNeedUsd: ProfileField<UsdRange>;
  useOfFunds: ProfileField<UseOfFundsTag[]>;
  useOfFundsNotes: ProfileField<string>;

  /** Infer-if-present — never block */
  stage: ProfileField<CompanyStage>;
  rdIntensity: ProfileField<RdIntensity>;
  productMaturity: ProfileField<ProductMaturity>;
  customerTypes: ProfileField<CustomerType[]>;

  /** Derived at infer time; not asked in Intake */
  operatesInUtah: ProfileField<boolean>;
};
```

## Field reference

| Field | Type | Must-have | Missing means | Notes |
| --- | --- | --- | --- | --- |
| `whatTheyDo` | free text | yes | Intake asks one clarifying sentence | Primary infer input; 1–3 sentences max in UI |
| `technologies` | string[] | yes | Intake asks "what tech?" | e.g. `AI`, `SaaS`, `sensors`, `marketplace` — open vocabulary, normalized lowercase |
| `sectors` | `SectorTag[]` | yes | Intake asks sector chips | Map infer text to enum tags; allow multi-select |
| `hqCountry` | string | yes | Intake asks country | Default infer `US` when US signals present |
| `hqState` | 2-letter US state | yes | Intake asks state | Required when `hqCountry` is `US` |
| `hqCity` | string | yes | Intake asks city | City name; optional display only for rank |
| `employeeCount` | `IntRange` | yes | Intake asks headcount | Point estimate: `min === max`. Brief uses exact counts |
| `revenue` | basis + USD | yes | Intake asks revenue band | Prefer `arr` when ARR stated; else `annual_revenue` |
| `capitalRaisedUsd` | USD | yes | Intake asks total raised | Equity + convertible total to date |
| `capitalNeedUsd` | `UsdRange` | yes | Intake asks funding target | Non-dilutive target range for this search |
| `useOfFunds` | `UseOfFundsTag[]` | yes | Intake asks use chips | Multi-select; `useOfFundsNotes` for color |
| `useOfFundsNotes` | free text | no | stays missing | e.g. "hospital pilots", "municipal pilots" |
| `stage` | enum | no | stays missing | Infer from revenue / employees / text |
| `rdIntensity` | enum | no | stays missing | `core` for deep tech / SBIR-shaped cos |
| `productMaturity` | enum | no | stays missing | |
| `customerTypes` | enum[] | no | stays missing | |
| `operatesInUtah` | boolean | no | derived | `true` when `hqState === "UT"` until multi-state HQ rules exist |

### `FieldStatus` semantics

| Status | Meaning | Intake behavior |
| --- | --- | --- |
| `known` | User typed, fixture loaded, or user confirmed infer | Show as filled |
| `inferred` | Model filled; user has not confirmed | Show confirm/edit chip before map |
| `missing` | Not inferable | Prompt for must-have; skip optional |

After infer, promote `inferred` → `known` when the user continues without editing. Demote to `missing` if the user clears a field.

### Range matching (for retrieve ticket)

- **Overlap** — Program band overlaps profile range → full credit in rank prompt.
- **Adjacent** — Within 2× outside band → `adjacent` fit possible with concern.
- **Point estimates** — Treat as `min === max`.

Scoring weights live on [Retrieve and probably-not floor](https://github.com/craigcossairt/startup-state-2/issues/2); this schema only defines shapes.

## Official fixtures (typed payloads)

All five are Utah-headquartered per the brief.

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

Store runtime copies under `data/fixtures/company-profile.fixture-*.json` when the app exists. This doc is the spec source until then.

## Intake flow binding

1. User sentence or fixture click.
2. **Infer** (Grok 4.6, structured output → `CompanyProfile` with `inferred` / `missing`).
3. **Confirm** — surface only `inferred` must-haves; user edits or accepts.
4. **Ask** — one screen for `missing` must-haves (chips + short text).
5. **Map** — all must-haves `known`; enrichments optional.

## What this schema is not

- Not Part 1 `Persona` (six fields, topic weights).
- Not a eligibility checklist.
- Not a persisted user account (session / fixture only for the weekend POC).
