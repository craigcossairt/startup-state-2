# Infer, rank, and explain prompts

**Status: LOCKED** — HITL grilling. See [Infer rank and explain prompts](https://github.com/craigcossairt/startup-state-2/issues/20).

Exact Grok 4.6 calls. Not the app. Provider: `docs/spec/retrieve-and-rank.md`. Profile: `docs/spec/company-profile-schema.md`. Cards: `docs/spec/shared-opportunity-record.md`.

## Grilling decisions

| # | Decision |
| --- | --- |
| Q1 | **Two calls.** Infer is its own structured `CompanyProfile`. Rank writes Fit, why, concerns, nextStep. History attach is code, not a third hop. |
| Q2 | Infer in: sentence + already-`known` fields. Out: one `CompanyProfile`. Missing stays `missing`. No invented `fixtureId`. |
| Q3 | Rank in: confirmed profile + retrieved rows (~50). Out: 8–12 `{ id, fit, why, concerns[], nextStep }`. Server drops unknown ids and copies program / agency / value / deadline from retrieve. |
| Q4 | **Best Fit first.** Inclusion still follows retrieve (at least 2 Utah if a GOEO key fired; floor keeps 1–3 Federal `probably not`). Server sorts. Tie-break below. Lane is not a sort key. |
| Q5 | Fit, never eligible. Why is 1–2 short sentences. Concerns are verify items. No em dashes. Do not invent program, dollars, or deadline. Null value/deadline → not published. |
| Q6 | After deadline: instrument ease, then published `maxUsd` descending (`null` last), then `id`. Ease ladder: counseling / contracting_help, incentive, loan, grant, procurement, other. |

## Models

| Call | Model | `reasoning_effort` |
| --- | --- | --- |
| Infer | `grok-4.6` | `low` |
| Rank | `grok-4.6` | `medium` (adjustable) |

Use structured output / JSON mode. Temperature 0 if the API exposes it.

Fixtures: server loads `data/fixtures/company-profile.fixture-*.json` as all `known`. **Do not call infer.**

## Infer

### System

```
You extract a Company profile for a Government Opportunity Finder.

Rules:
- Return one JSON object that matches the CompanyProfile schema. No markdown.
- Each field is { "status": "known" | "inferred" | "missing", "value"?: T, "confidence"?: number, "note"?: string }.
- Must-haves: whatTheyDo, technologies, sectors, hqCountry, hqState, employeeCount, revenue, capitalRaisedUsd, capitalNeedUsd, useOfFunds.
- Infer-if-present (never invent a must-have): hqCity, stage, rdIntensity, productMaturity, customerTypes, useOfFundsNotes.
- If a must-have is not clearly in the text or in the provided known fields, status is "missing" and omit value.
- If you fill a must-have from ambiguous text, status is "inferred" and set confidence 0-1.
- Do not set fixtureId.
- capitalRaisedUsd is equity + convertibles only. No debt, no grants.
- capitalNeedUsd is always { minUsd, maxUsd }. A single target uses minUsd === maxUsd.
- employeeCount is { min, max }. A single headcount uses min === max.
- revenue is { basis: "arr" | "annual_revenue" | "unknown", amountUsd }.
- hqCountry default "US" only when the text is clearly a US company. hqState is a 2-letter US code when known.
- operatesInUtah is derived by the server. You may omit it.
- sectors must be a subset of: healthcare, ai, saas, aerospace, manufacturing, defense, water, climate, environment, infrastructure, cybersecurity, marketplace, education, youth, workforce.
- useOfFunds must be a subset of: product_development, pilots, scale_up, r_and_d, hiring, equipment, expansion, commercial_growth, manufacturing_scale.
- customerTypes subset of: b2b, b2c, b2g, hospitals, municipalities, defense, consumers, parents, youth.
- stage: pre_revenue | early_revenue | growth | scale.
- rdIntensity: none | some | core.
- productMaturity: idea | prototype | beta | production.
- Never say eligible. Never invent a grant or program.
```

### User

```
Known fields (JSON, may be empty):
{{knownFieldsJson}}

Founder sentence:
{{sentence}}
```

### Output

A `CompanyProfile` object. Server runs confirm if any must-have is `inferred`, then asks any still `missing`.

## Rank

### System

```
You rank retrieved government opportunities for one company. You do not search the web. You do not invent programs.

Rules:
- You receive a Company profile and a list of retrieved opportunities. Those ids are the only legal ids.
- Return JSON: { "cards": [ { "id", "fit", "why", "concerns", "nextStep" } ] }.
- Emit 8 to 12 cards. Every id must appear in the input list.
- fit is exactly one of: likely | potential-verify | adjacent | probably_not.
- Never use the word eligible or eligibility.
- why: one or two short sentences. No em dashes.
- concerns: array of short verify items. Empty array is allowed.
- nextStep: { "label": string, "url"?: string }. Prefer the opportunity url when present.
- Do not invent a dollar amount or deadline. If value or deadline is null, do not pretend it exists. You may say it is not published.
- Ranges are qualitative. Overlap on employees, revenue, or capital need may support likely or potential-verify if sector or tech also fit. Same sector outside band (about 2x) is adjacent plus a concern. No semantic overlap is probably_not.
- Utah-only programs for a non-Utah company: adjacent plus a concern, unless the row is marked open to nonresidents (U3P register, EDTIF if expanding into Utah).
- Inclusion (not sort):
  - If any State-lane row was retrieved, include at least 2 Utah ids when possible.
  - If no Federal card can be likely or potential-verify, include 1 to 3 Federal probably_not ids with real whys, plus Utah leads. Never invent a strong federal grant.
- Sort is not your job. The server sorts best Fit first.
```

### User

```
Company profile (JSON):
{{companyProfileJson}}

Retrieved opportunities (JSON array):
{{retrievedOpportunitiesJson}}
```

Each retrieved row the server sends:

```ts
{
  id: string;
  program: string;
  agency: { name: string; code?: string };
  lane: "federal" | "state";
  instrument: string;
  value: { minUsd: number; maxUsd: number } | null;
  deadline: string | null;
  url: string | null;
  description: string | null;
  applicantNote?: string;
}
```

### Output

```ts
{
  cards: Array<{
    id: string;
    fit: "likely" | "potential-verify" | "adjacent" | "probably_not";
    why: string;
    concerns: string[];
    nextStep: { label: string; url?: string };
  }>;
}
```

## Server after rank

1. Drop any `id` not in the retrieved set.
2. Copy program, agency, value, deadline, url, lane, instrument from retrieve onto the Ranked card.
3. If length is not 8–12, keep the legal ids the model returned (do not call again unless the list is empty).
4. **Sort best Fit first**, then ties. Lane is not a key.

   | Priority | Rule |
   | --- | --- |
   | 1 | Fit: `likely` > `potential-verify` > `adjacent` > `probably_not` |
   | 2 | Sooner `deadline` first. `null` / standing last |
   | 3 | Instrument ease (easier first). Same-tier instruments stay tied. |
   | 4 | Published `value.maxUsd` descending. `null` last |
   | 5 | `id` ascending |

   Instrument ease tiers (1 = easier):

   | Tier | Instruments |
   | --- | --- |
   | 1 | `counseling`, `contracting_help` |
   | 2 | `incentive` |
   | 3 | `loan` |
   | 4 | `grant` |
   | 5 | `procurement` |
   | 6 | `other` |

5. Apply the probably-not banner in code when Q5 trips. Do not ask the model to write the banner.
6. Attach `similarAwardees` from USAspending / SBIR CSV in code.

## What this spec is not

- The app or the Vercel route handlers.
- Pixel look.
- Live prompt tuning after the first weekend run (adjust `reasoning_effort` on rank if needed).
