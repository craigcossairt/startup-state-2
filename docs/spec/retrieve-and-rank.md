# Retrieve and probably-not floor

**Status: LOCKED** — HITL grilling rounds 1–2 complete. See [Retrieve and probably-not floor](https://github.com/craigcossairt/startup-state-2/issues/2).

How a Company profile becomes Opportunity Map cards: retrieve from official sources and the GOEO table, then Grok ranks **only retrieved IDs** and assigns Fit labels. Default view is the retrieved set, not all 213 GOEO rows.

Company profile: `docs/spec/company-profile-schema.md`.

## Grilling decisions

### Round 1 (architecture and floor)

| # | Decision |
| --- | --- |
| Q1 | **Per-source adapters** on one `CompanyProfile`. No fused blob. No LLM-invented programs. Each adapter returns IDs only from that source’s catalog or cache. |
| Q2 | GOEO retrieve keys fire from **deterministic profile rules**, not LLM. Chips can add keys. Six keys: `sbir-help`, `contracting`, `state-capital`, `workforce`, `counseling`, `trade`. |
| Q3 | Grants.gov `search2` keyword = `whatTheyDo` + `technologies` + `sectors` labels, capped ~200 chars. **No Utah filter** on federal search. |
| Q4 | Cap **~50 retrieved IDs** before rank. Rank surfaces **8–12 cards** by default. Chips widen the retrieve set, not the rank list, for the weekend POC (except Fit chips, which filter the ranked list). |
| Q5 | **Probably-not floor:** after rank, if no Federal card is `likely` or `potential-verify`, and at least one Utah card is `likely`, `potential-verify`, or strong `adjacent`, show a banner above the list. Do not hide federal `probably not` rows that have real whys. |
| Q6 | Fixture-5: **1–3 Federal `probably not`** cards plus State-lane lead. Never invent a strong federal grant. |
| Q7 | Employee / revenue / capital ranges are **prompt rules, not hard gates**. Overlap can support `likely` / `potential-verify`; same sector outside band → `adjacent` + concern; no semantic overlap → `probably not`. Weekend rank is qualitative (no numeric score). |

### Round 2 (adapters, matrix, chips, mix)

| # | Decision |
| --- | --- |
| Q8 | SAM is **join-only**. Fill program description / ALN on Grants.gov cards from the cached dump. No standalone SAM retrieve IDs. |
| Q9 | USAspending is **history attach**, not retrieve. Similar awardees join onto ranked cards via CFDA / NAICS / keyword. Prefer Utah recipients when `hqState` is `UT`. |
| Q10 | SBIR **award CSV** = similar awardees on SBIR-shaped cards. Open SBIR/STTR opportunities come from **Grants.gov**. Do not live-hit SBIR.gov on Friday. |
| Q11 | GOEO firing matrix below (OR within a row; union of fired keys). |
| Q12 | Weekend chips: **Lane** (Federal / Utah), **GOEO keys** (the six), **`directory`**, **Fit** (filter ranked list only). No community or geography chips. |
| Q13 | Default rank mix: Federal-first, at least 2 Utah cards if any GOEO key fired. Floor tripped: Utah-first, then 1–3 Federal `probably not`. Still 8–12 total. |
| Q14 | Floor banner: **Traditional federal grants look like a poor fit for this company. Utah programs below are the stronger place to start.** |

## Pipeline

```
Company profile (all must-haves known)
        ↓
Per-source retrieve adapters  →  retrieved ID set (≤ ~50)
  Grants.gov search2          →  open / forecasted opportunity IDs
  GOEO six keys               →  State-lane row IDs
  Curated Utah cards          →  seven standing ids (always)
  SAM / USAspending / SBIR CSV →  not retrieve IDs (join / history)
        ↓
Grok 4.6 rank / explain (reasoning medium)
  may emit only retrieved IDs
  Fit label per card
        ↓
Attach history (USAspending, SBIR CSV) onto ranked cards
        ↓
Opportunity Map (8–12 cards)
  + probably-not floor banner when Q5 trips
  + Lane / GOEO / directory chips re-retrieve then re-rank
  + Fit chips filter the ranked list only
```

Server drops any rank ID not in the retrieved set and copies program / agency / value / deadline from retrieve. SAM text fills description / ALN on Grants.gov cards.

## Per-source adapters

| Adapter | Role | Retrieve IDs? |
| --- | --- | --- |
| Grants.gov search2 | Open list (`posted\|forecasted`). Keyword from Q3. Small-business eligibility when the profile is a startup. Live with backoff. | Yes |
| SAM Assistance Listings | Cached CFDA catalog. Join onto Grants.gov by ALN / CFDA. No live Friday hits. | No |
| USAspending V2 | Similar awardees on ranked cards. Prefer Utah when `hqState` is `UT`. | No |
| SBIR award CSV | Similar awardees on SBIR-shaped cards. APIs stay 403. | No |
| GOEO table | State lane. Six keys from Q11. Default map = fired slice, not 213. | Yes |
| Curated Utah cards | Seven official standing cards. Always retrieved. See `docs/spec/utah-state-lane-mix.md`. | Yes |

Federal adapters **ignore Utah residency**. A Utah State-lane row for a non-Utah company ranks as a real Fit only when the program allows nonresidents; otherwise `adjacent` + concern. National rows parked in the GOEO table (SBA, SCORE, EDA, USCS) may rank without that Utah-only concern.

## GOEO firing matrix (Q11)

Fire a key when **any** cell in its row is true. Union of fired keys is the first retrieve.

| Key | Typical rows | Fire when |
| --- | --- | --- |
| `sbir-help` | Nucleus (Innovation Center) | `rdIntensity` is `core` or `some`, **or** `useOfFunds` includes `r_and_d`, **or** sectors include `ai` / `healthcare` / `aerospace` / `cybersecurity` / `water` / `climate` / `environment` |
| `contracting` | APEX | sectors include `defense` or `aerospace`, **or** `customerTypes` includes `b2g` or `defense` |
| `state-capital` | USBCI, UTIF, UMLF, Get Started, … | `capitalNeedUsd` status is `known` |
| `workforce` | DWS, Talent Ready, Custom Fit, MEP, … | `useOfFunds` includes `hiring`, `pilots`, or `manufacturing_scale`, **or** sectors include `workforce` / `education` / `youth` / `marketplace` |
| `counseling` | SBDC, SCORE, SBA, … | `stage` is `pre_revenue` or `early_revenue`, **or** sectors include `marketplace` and (`youth` or `education`), **or** neither `sbir-help` nor `contracting` fired |
| `trade` | WTC, USCS | `whatTheyDo` or customers clearly export. **Do not fire** on the five official fixtures by default. |

`directory` chip adds leftover GOEO rows (~180). Not a first-pass retrieve key.

Private capital (Kickstart, Pelion, angels, RevRoad) stays out of `state-capital`.

## Grants.gov keyword (Q3)

Build a string, then truncate to ~200 characters at a word boundary:

1. `whatTheyDo.value`
2. `technologies.value` joined
3. `sectors.value` enum labels joined

Do not append Utah, city, or employee counts to the federal keyword.

## Caps (Q4)

| Stage | Cap |
| --- | --- |
| Retrieved IDs (Grants.gov + GOEO, deduped) | ~50 |
| Ranked cards on the default Opportunity Map | 8–12 |
| Fixture-5 federal `probably not` | 1–3 |

Lane / GOEO-key / `directory` chips re-run retrieve, still capped at ~50, then re-rank.

## Rank mix (Q13)

| Condition | Order |
| --- | --- |
| Floor not tripped | Federal-first. Include at least 2 Utah cards if any GOEO key fired. |
| Floor tripped | Utah-first (Nucleus / APEX / counseling as available), then 1–3 Federal `probably not`. |

Still 8–12 cards total.

## Probably-not floor (Q5–Q6, Q14)

**Trip when all are true after rank:**

1. Zero Federal cards with Fit `likely` or `potential-verify`.
2. At least one Utah-badge card with Fit `likely`, `potential-verify`, or strong `adjacent`.

**Banner (user-facing, no em dash):**

> Traditional federal grants look like a poor fit for this company. Utah programs below are the stronger place to start.

Federal `probably not` cards stay in the list under the banner with why / concerns.

**Fixture-5 (Youth marketplace):** floor should trip. Show 1–3 Federal `probably not` (example: SBIR/STTR poor fit for a parent/youth marketplace) plus State `workforce` / `counseling` lead. Do not invent a strong federal grant.

## Weekend chips (Q12)

| Chip | Effect |
| --- | --- |
| Lane: Federal / Utah | Re-retrieve that lane only, then re-rank |
| GOEO key | Add that key and re-retrieve State lane |
| `directory` | Include leftover GOEO ~180, still cap ~50 |
| Fit | Filter the **already ranked** list. Does not re-retrieve |

No community or geography chips for the weekend POC.

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
- Shared opportunity record shape (locked: `docs/spec/shared-opportunity-record.md`).
- Curated Utah official-card mix (locked: `docs/spec/utah-state-lane-mix.md`).
- Intake / map structure (locked: `docs/spec/intake-and-map-look.md`). Visual end state is a later ticket.
