# Retrieve and probably-not floor

**Status: DRAFT** — round 1 grilling complete. Round 2 open on per-source adapters (SAM / SBIR / USAspending roles), GOEO firing matrix, chips, and rank mix. Locked when [Retrieve and probably-not floor](https://github.com/craigcossairt/startup-state-2/issues/2) closes after HITL.

How a Company profile becomes Opportunity Map cards: retrieve from official sources and the GOEO table, then Grok ranks **only retrieved IDs** and assigns Fit labels. Default view is the retrieved set, not all 213 GOEO rows.

Company profile: `docs/spec/company-profile-schema.md`.

## Grilling decisions

### Round 1 (architecture and floor)

| # | Decision |
| --- | --- |
| Q1 | **Per-source adapters** on one `CompanyProfile`. No fused blob. No LLM-invented programs. Each adapter returns IDs only from that source’s catalog or cache. |
| Q2 | GOEO retrieve keys fire from **deterministic profile rules**, not LLM. Chips can add keys. Six keys: `sbir-help`, `contracting`, `state-capital`, `workforce`, `counseling`, `trade`. |
| Q3 | Grants.gov `search2` keyword = `whatTheyDo` + `technologies` + `sectors` labels, capped ~200 chars. **No Utah filter** on federal search. |
| Q4 | Cap **~50 retrieved IDs** before rank. Rank surfaces **8–12 cards** by default. Chips widen the retrieve set, not the rank list, for the weekend POC. |
| Q5 | **Probably-not floor:** after rank, if no Federal card is `likely` or `potential-verify`, and at least one Utah card is `likely`, `potential-verify`, or strong `adjacent`, show a banner above the list. Do not hide federal `probably not` rows that have real whys. |
| Q6 | Fixture-5: **1–3 Federal `probably not`** cards plus State-lane lead. Never invent a strong federal grant. |
| Q7 | Employee / revenue / capital ranges are **prompt rules, not hard gates**. Overlap can support `likely` / `potential-verify`; same sector outside band → `adjacent` + concern; no semantic overlap → `probably not`. Weekend rank is qualitative (no numeric score). |

## Pipeline

```
Company profile (all must-haves known)
        ↓
Per-source retrieve adapters  →  retrieved ID set (≤ ~50)
        ↓
Grok 4.6 rank / explain (reasoning medium)
  may emit only retrieved IDs
  Fit label per card
        ↓
Opportunity Map (8–12 cards)
  + probably-not floor banner when Q5 trips
  + chips that re-retrieve (widen keys / keyword), then re-rank
```

Server drops any rank ID not in the retrieved set and copies program / agency / value / deadline from retrieve.

## Per-source adapters (round 1 shape)

Exact SAM / SBIR / USAspending retrieve roles: round 2.

| Adapter | Lane | Round 1 lock |
| --- | --- | --- |
| Grants.gov search2 | Federal | Keyword from Q3. Statuses `posted\|forecasted`. Small-business eligibility when profile looks like a startup. Live with backoff. |
| SAM Assistance Listings | Federal | Cache only (no live Friday). Round 2: catalog cards vs ALN join-only. |
| USAspending V2 | Federal (history) | Not an open-opportunity list. Round 2: similar-awardee attach vs retrieve IDs. |
| SBIR award CSV | Federal (history / topics) | APIs 403. Round 2: CSV for similar awardees vs solicitation cards. |
| GOEO table | State (Utah) | Six keys from Q2. Default map = fired slice, not 213. |

Federal adapters **ignore Utah residency**. A Utah State-lane row for a non-Utah company ranks as a real Fit only when the program allows nonresidents; otherwise `adjacent` + concern. National rows parked in the GOEO table (SBA, SCORE, EDA, USCS) may rank without that Utah-only concern.

## GOEO keys (from [GOEO table categories](https://github.com/craigcossairt/startup-state-2/issues/6))

| Key | Typical rows | Round 1 fire hint (matrix locked in round 2) |
| --- | --- | --- |
| `sbir-help` | Nucleus (Innovation Center) | `rdIntensity` core / some, or `useOfFunds` includes `r_and_d`, or sectors look deep-tech |
| `contracting` | APEX | sectors `defense` / `aerospace`, or customers `b2g` / `defense` |
| `state-capital` | USBCI, UTIF, UMLF, Get Started, … | always when `capitalNeedUsd` is known |
| `workforce` | DWS, Talent Ready, Custom Fit, MEP, … | `useOfFunds` `hiring` / `pilots` / `manufacturing_scale`, or fixture-5 sectors |
| `counseling` | SBDC, SCORE, SBA, … | fixture-5 shape; or early stage; or no strong federal |
| `trade` | WTC, USCS | only if infer text / customers clearly export (do not fire by default) |

`directory` chip opts into leftover GOEO rows (~180). Not a retrieve key on first pass.

## Grants.gov keyword (Q3)

Build a string, then truncate to ~200 characters at a word boundary:

1. `whatTheyDo.value`
2. `technologies.value` joined
3. `sectors.value` enum labels joined

Do not append Utah, city, or employee counts to the federal keyword.

## Caps (Q4)

| Stage | Cap |
| --- | --- |
| Retrieved IDs (all adapters, deduped) | ~50 |
| Ranked cards on the default Opportunity Map | 8–12 |
| Fixture-5 federal `probably not` | 1–3 |

Chips re-run retrieve with extra keys or a wider keyword, still capped at ~50, then re-rank.

## Probably-not floor (Q5–Q6)

**Trip when all are true after rank:**

1. Zero Federal cards with Fit `likely` or `potential-verify`.
2. At least one Utah-badge card with Fit `likely`, `potential-verify`, or strong `adjacent`.

**UI:** one banner above the ranked list. Federal `probably not` cards stay in the list with why / concerns. State cards may lead the sort when the floor trips.

**Fixture-5 (Youth marketplace):** floor should trip. Show 1–3 Federal `probably not` (example: SBIR/STTR poor fit for a parent/youth marketplace) plus State `workforce` / `counseling` lead. Do not invent a strong federal grant.

Banner copy and sort-when-tripped: round 2.

## Range matching in rank (Q7)

Qualitative instructions in the rank prompt. Not a numeric scorer.

| Profile vs program band | Fit effect |
| --- | --- |
| Overlap on employees, revenue, or capital need | May support `likely` or `potential-verify` if sector/tech also fit |
| Same sector, outside band (within ~2×) | `adjacent` + concern |
| No semantic overlap (wrong sector, consumer marketplace vs SBIR R&D, etc.) | `probably not` |

## What this spec is not

- Exact infer / rank / explain prompt text (still fog on the map).
- Numeric scoring weights.
- Shared opportunity record shape ([Shared opportunity record](https://github.com/craigcossairt/startup-state-2/issues/3)).
- Curated Utah official-card mix vs GOEO-only ([Utah State-lane mix](https://github.com/craigcossairt/startup-state-2/issues/13)).

## Round 2 (open)

- SAM: standing CFDA cards vs ALN join onto Grants.gov only
- USAspending / SBIR CSV: retrieve IDs vs history attached to cards
- Full GOEO key-firing table from `CompanyProfile`
- Weekend chip set
- Rank mix when the floor does / does not trip
