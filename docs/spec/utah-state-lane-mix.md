# Utah State-lane mix

**Status: LOCKED** — HITL grilling rounds 1–2. See [Utah State-lane mix](https://github.com/craigcossairt/startup-state-2/issues/13).

What sits in the State lane this weekend. There is no Utah opportunity API. Facts: `docs/research/utah-state-apis.md`. Retrieve rules: `docs/spec/retrieve-and-rank.md`. Record shape: `docs/spec/shared-opportunity-record.md`.

## Grilling decisions

| # | Decision |
| --- | --- |
| Q1 | **Both.** Six-key GOEO retrieve plus seven curated official cards. |
| Q2 | U3P is **one portal card** (`curated:u3p-register`). No scrape of open or past bids. |
| Q3 | Events Calendar REST is **out** of weekend retrieve. |
| Q4 | Curated set is the seven slugs below. Skip EAG, REDI, Enterprise Zone, RCOG, Rural County, UDAF, Outdoor Rec, Nucleus Fund. |
| Q5 | **Always retrieve all seven** curated ids. Rank assigns Fit. Do not drop them before rank. |

## Retrieve

```
State-lane retrieve IDs
  ├─ GOEO six keys → goeo:<external_id>   (fired slice, not all 213)
  └─ Curated seven → curated:<slug>       (always)
```

Still capped at ~50 ids with Grants.gov before rank. Seven curated ids always fit.

`directory` chip still adds leftover GOEO rows. It does not add skipped official programs (EAG, REDI, …) unless we curate them later.

## Curated cards

`source: "curated"`. `lane: "state"`. `jurisdiction: "UT"`. `status: "standing"` unless noted.

| id | program | agency | instrument | value | deadline | url | Out-of-Utah Fit |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `curated:nucleus-grow` | Nucleus Grow | Nucleus | counseling | null | null | https://www.nucleusutah.org/grow | `adjacent` + concern (needs Utah HQ or Utah registration) |
| `curated:utif` | Utah Technology Innovation Funding | Nucleus / GOEO | grant | microgrant $3k (rural $5k); loan $50k (rural $60k) | standing; apply ≥ 4 weeks before the named SBIR deadline | https://www.nucleusutah.org/utif | `probably not` unless Utah Corporations registration exists |
| `curated:usbci` | USBCI lending (LPP / CAP) | GOEO / USBCI | loan | bands from the official USBCI page | null | https://business.utah.gov/usbci/ | `probably not` (Utah small businesses) |
| `curated:apex` | APEX Accelerator | GOEO / APEX | contracting_help | null | null | https://business.utah.gov/apex/ | `adjacent` + concern (Utah county signup) |
| `curated:u3p-register` | Register on U3P | Division of Purchasing | procurement | null | null | https://utah.bonfirehub.com/portal/?tab=openOpportunities | may be `likely` / `potential-verify` (any qualified vendor) |
| `curated:sbdc` | Utah SBDC advising | Utah SBDC | counseling | null | null | official SBDC intake | `adjacent` + concern unless they will use a Utah center |
| `curated:edtif` | EDTIF / REDTIF | GOEO | incentive | % of new state revenue (urban up to 30%; most-rural 50%) | standing; board vote | https://business.utah.gov/business-incentives/ | may be real Fit if expanding or relocating into Utah |

Copy program / agency / value / deadline / url from this table at retrieve time. Do not invent windows. `null` displays as **Not published**.

One USBCI card covers LPP and CAP. Next step points at the listed-lender path on the official page.

## Rank notes

- Utah HQ (`hqState === "UT"`): Nucleus / UTIF / USBCI / APEX / SBDC can be `likely` or `potential-verify` when the profile matches (SBIR/R&D → Nucleus/UTIF; capital need → USBCI; b2g/defense → APEX; fixture-5 → SBDC).
- Fixture-5 floor: SBDC and USBCI are the State-lane lead. EAG/REDI/UTIF stay off this list (not curated).
- Fixture-1: Nucleus Grow (and UTIF if an open SBIR parent is on the federal cards).
- Do not scrape U3P to attach live bid rows onto `u3p-register`.

## Out of weekend spec

- Scraping Bonfire open or past opportunities
- Events Calendar as a retrieve source
- EAG (not open as of 2026-08-13)
- REDI, Enterprise Zone, RCOG, Rural County Grant (wrong applicant or no rural fixture)
- UDAF, Outdoor Rec, Nucleus Fund
- Inventing programs
- A second Utah-only site

## What this spec is not

- Pixel look ([Visual end state for Intake and Opportunity Map](https://github.com/craigcossairt/startup-state-2/issues/18)).
- Exact infer / rank / explain prompt text (locked: `docs/spec/infer-rank-explain-prompts.md`).
- GOEO key firing matrix (already on `docs/spec/retrieve-and-rank.md`).
