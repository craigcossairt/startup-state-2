# Four federal APIs: card fields, auth, rate limits, weekend cache

Researched 2026-08-13 for [issue #7](https://github.com/craigcossairt/startup-state-2/issues/7). Primary sources only (official API guides, first-party contracts, and live calls to those same hosts). Brief URLs that 404 are called out.

**Certainty.** Field lists and auth rules are level 2 (the owning doc) unless marked. Live probes on 2026-08-13 are level 4 (I ran the request). Anything I could not get to 4 is labeled unproven.

## Short answer

| Card field | Open opportunity (who is paying, how much, when due) | History / similar awardees |
|---|---|---|
| **Program** | Grants.gov `title` / `opportunityTitle`. SAM `title` + `assistanceListingId` (CFDA). SBIR `solicitation_title` / `topic_title`. | USAspending `CFDA Number` / `Assistance Listings`. SBIR `award_title` + `program` (SBIR/STTR). |
| **Agency** | Grants.gov `agency` + `agencyCode`. SAM `federalOrganization`. SBIR `agency` / `branch`. | USAspending `Awarding Agency` / `Awarding Sub Agency`. SBIR `agency` / `branch`. |
| **Value** | Grants.gov **detail only**: `synopsis.awardCeiling` / `awardFloor` (often the string `"none"`). SAM program-year min/max/avg, not a NOFO ceiling. SBIR solicitations have **no dollar field**. | USAspending `Award Amount`. SBIR `award_amount`. |
| **Deadline** | Grants.gov search2 `closeDate`; detail `synopsis.responseDate`. Forecasts often have an empty close date. SAM deadlines are catalog text, not a live NOFO close. SBIR `close_date` / `application_due_date`. | Neither USAspending nor SBIR awards is an application deadline. USAspending `End Date` is period of performance. |
| **Similar awardees** | None of the open-opportunity APIs return recipients. | USAspending `Recipient Name` + location + amount + CFDA/NAICS. SBIR `firm` + city/state + amount + abstract. |

Do **not** live-hit SAM or SBIR on Friday. SAM needs a personal API key and is 10 requests/day without a SAM.gov Role. SBIR's own API pages say the APIs are under maintenance; live GETs returned HTTP 403. Grants.gov search2/fetchOpportunity and USAspending V2 search need no key and worked live.

**Cache before Friday 2026-08-14:** (1) SAM Active listings dump, after a SAM.gov account with a Role; (2) SBIR award CSV (and a topics/solicitations pull if the API is still 403); (3) a small Grants.gov posted+forecasted slice for the five fixtures; (4) USAspending similar-awardee slices keyed by CFDA / NAICS / Utah. Details below.

---

## 1. Grants.gov search2 + fetchOpportunity

**Owners.** [API Guide](https://www.grants.gov/api/api-guide), [search2](https://www.grants.gov/api/common/search2), [fetchOpportunity](https://www.grants.gov/api/common/fetchopportunity), [status codes](https://www.grants.gov/api/status-codes), [versioning](https://www.grants.gov/api/api-versioning).

Production host: `https://api.grants.gov`. Staging: `https://api.staging.grants.gov`. Paths: `POST /v1/api/search2`, `POST /v1/api/fetchOpportunity`.

### Auth

Not required for search2 or fetchOpportunity ([guide](https://www.grants.gov/api/api-guide), [search2](https://www.grants.gov/api/common/search2), [fetchOpportunity](https://www.grants.gov/api/common/fetchopportunity)). Other Grants.gov REST APIs need a key from the Help Desk. Do not confuse the two.

### Rate limits

No numeric cap is published. Status 429 is documented: "Too many of the user's requests hit the API too quickly. We recommend an exponential backoff" ([status codes](https://www.grants.gov/api/status-codes)). Treat 429 as real. Unproven: exact tokens/minute.

### What it returns (card mapping)

**search2** is a list. Official sample `oppHits` fields ([search2](https://www.grants.gov/api/common/search2)): `id`, `number`, `title`, `agencyCode`, `agencyName`, `openDate`, `closeDate`, `oppStatus`, `docType`, `alnist`.

Live production on 2026-08-13 used slightly different names (level 4). Treat the live names as what the weekend code should parse, and keep the sample names as aliases:

| Card | Live field | Official sample name | Notes |
|---|---|---|---|
| Program | `title`, `number` | same | `id` is the integer for fetchOpportunity. |
| Agency | `agency`, `agencyCode` | `agencyName`, `agencyCode` | Example: `National Institutes of Health` / `HHS-NIH11`. |
| Value | **absent** | absent | List rows have no ceiling/floor. |
| Deadline | `closeDate` (`MM/DD/YYYY`) | same | Empty string on many forecasts. Posted NIH SBIR parent `PA-27-100` had `closeDate: "04/05/2027"`. |
| ALN / CFDA | `cfdaList` | `alnist` | Join key to SAM and USAspending. |
| Status | `oppStatus`, `docType` | same | Statuses: `posted`, `forecasted`, `closed`, `archived`. |

search2 also returns facet counts (`oppStatusOptions`, `eligibilities`, `fundingCategories`, `fundingInstruments`, `agencies`) and `hitCount` / `startRecord` for paging.

**fetchOpportunity** is the card body. Request: `{ "opportunityId": <search2 id> }`. Official sample plus live `PA-27-100` (id `359671`):

| Card | Field | Notes |
|---|---|---|
| Program | `opportunityTitle`, `opportunityNumber` | Also `cfdas` / sample `alns[]` with `alnNumber` + `programTitle`. |
| Agency | `synopsis.agencyName`, `owningAgencyCode` | Contact: `agencyContactName`, `agencyContactEmail`. |
| Value | `synopsis.awardCeiling`, `synopsis.awardFloor` | Live NIH SBIR parent returned the string `"none"` for both. Do not invent a range. |
| Deadline | `synopsis.responseDate` | Live: `"Apr 05, 2027 12:00:00 AM EDT"`. Matches search2 `closeDate`. There is **no** `closeDate` on the detail object. Also `archiveDate`, `postingDate`. |
| Eligibility (concerns) | `synopsis.applicantTypes[]`, `applicantEligibilityDesc` | Codes in [status codes](https://www.grants.gov/api/status-codes). Small business = `23`. |
| Why / next step | `synopsis.synopsisDesc`, `fundingInstruments[]`, `fundingActivityCategories[]`, `assistURL` | `costSharing` is boolean. Attachments live under `synopsisAttachmentFolders`. |

search2 does **not** return similar awardees. Use the ALN / title as the join into USAspending or SBIR.

### Retrieve query shape

```http
POST https://api.grants.gov/v1/api/search2
Content-Type: application/json
```

Documented body keys ([search2](https://www.grants.gov/api/common/search2) request + echoed `searchParams`): `rows`, `keyword`, `oppNum`, `eligibilities`, `agencies`, `oppStatuses`, `aln` (live echo also has `cfda`), `fundingCategories`, plus echoed-but-useful `fundingInstruments`, `startRecordNum`, `sortBy`.

Statuses combine with `|` (`forecasted|posted`). Official cURL also shows `oppStatuses` as an array of combined strings; prefer the documented `|` form unless a live check says otherwise.

Fixture-shaped example (small-business, open + forecast, health):

```json
{
  "rows": 25,
  "startRecordNum": 0,
  "keyword": "SBIR healthcare",
  "oppStatuses": "forecasted|posted",
  "eligibilities": "23",
  "fundingCategories": "HL"
}
```

Eligibility codes we will actually use ([status codes](https://www.grants.gov/api/status-codes)): `23` small businesses, `22` other for-profits, `21` individuals, `25` others, `99` unrestricted. Category codes: `HL` Health, `ST` Science and Technology / R&D, `EN` Energy, `ENV` Environment, `ELT` Employment Labor Training, `ED` Education, `BC` Business and Commerce.

Then one detail call per card candidate:

```json
POST https://api.grants.gov/v1/api/fetchOpportunity
{ "opportunityId": 359671 }
```

### Cache advice (~24h)

Safe to call live (no key). Still cache:

1. One search2 page per fixture keyword set with `oppStatuses: "forecasted|posted"` and `eligibilities: "23"` (and a second pass without eligibility, so unrestricted NOFOs are not dropped).
2. fetchOpportunity for every hit you might show (value + eligibility text + synopsis).
3. Do not try to ingest closed/archived (hundreds per keyword; live `healthcare` + small business was 52 posted / 16 forecasted / 113 closed / 688 archived).

Refresh: once Thursday night, once Friday morning. search2 is cheap; fetchOpportunity is the N+1.

### Gotchas

- Official search2 sample uses `agencyName` / `alnist`; live used `agency` / `cfdaList`. Parse both.
- One official cURL is broken: `"fundingCategories": "HL", "": "HHS-NIH11"` ([search2](https://www.grants.gov/api/common/search2)). Real agency filter key is `agencies`.
- `awardCeiling` / `awardFloor` are strings and may be `"none"`. Empty `closeDate` on forecasts is normal.
- 401/403 exist on the status page but do not apply to these two endpoints. 5xx are on Grants.gov.
- SOAP system-to-system is a different portfolio ([guide](https://www.grants.gov/api/api-guide)). Ignore it.

---

## 2. SAM.gov Assistance Listings

**Owners.** The brief link [open.gsa.gov/api/assistance-listings/](https://open.gsa.gov/api/assistance-listings/) **404s**. The live GSA page is [SAM.gov Assistance Listings Public API](https://open.gsa.gov/api/assistance-listings-api/). OpenAPI is linked from that page as `v1/assistance-listings-api.openapi.yaml`.

Production: `GET https://api.sam.gov/assistance-listings/v1/search`. Alpha: `https://api-alpha.sam.gov/assistance-listings/v1/search`.

This is the CFDA catalog (program descriptions), **not** open NOFOs and **not** award recipients.

### Auth

Required. `api_key` query param. Create a Public API Key on [sam.gov/profile/details](https://sam.gov/profile/details) (OTP to the account email). Alpha key from alpha.SAM.gov; production key from production SAM.gov. Non-federal and federal personal accounts are both documented.

### Rate limits

Published daily caps by account type ([same page](https://open.gsa.gov/api/assistance-listings-api/)):

| Account | Key | Daily cap |
|---|---|---|
| Non-federal, no Role in SAM.gov | Personal | **10 requests/day** |
| Non-federal, with a Role | Personal | 1,000 / day |
| Federal user | Personal | 1,000 / day |

`pageSize` max 1000, default 10. `pageNumber` default 0.

A no-role key cannot support live retrieve on demo day. Even paging the catalog at 1000/page burns the 10-request budget in one dump. **Get a Role on the SAM.gov account before Friday, or finish the dump with the 10-request key and never call SAM again during the weekend.**

Live `GET` without a valid key on 2026-08-13 returned HTTP 404 and an empty body (level 4). Do not assume a nice 401 JSON.

### What it returns (card mapping)

Request filters (no free-text keyword): `status` (`Active` / `Inactive` / `All`, default `Active`), `assistanceListingId`, `publishedDateFrom` / `publishedDateTo`, `assistanceTypes[]`, `beneficiaryTypes[]`, `applicantTypes[]`, `organizationCodes[]`, `organizationLevel` (Department / Agency / Office), `coreBasedStatisticalDelineations`.

Response container: `totalRecords`, `pageSize`, `pageNumber`, `totalPages`, `assistanceListingsData[]`.

| Card | Path | Notes |
|---|---|---|
| Program | `title`, `popularLongName`, `popularShortName`, `assistanceListingId` | `assistanceListingId` is the CFDA / ALN (example `10.080`). |
| Agency | `federalOrganization.department`, `.agency`, `.office` + codes | Department/agency are FPDS codes; office is AAC. |
| Value | `financialInformation.rangeAndAverageAssistance[].minimumAwardAmount` / `maximumAwardAmount` / `averageAwardAmount` (v2.0) | Also `obligations[].values[].actual` / `estimate` by year, and `isFundedCurrentFY`. This is program-year money, not a current NOFO ceiling. |
| Deadline | `assistanceApplication.deadlines.list[].start` / `.end` / `.description` | Catalog-level. Often narrative or empty. Not a substitute for Grants.gov `closeDate`. |
| Why / concerns | `overview.objective`, `overview.assistanceListingDescription`, `criteriaForApplying.applicant.types[]` + `.description`, `assistanceRestriction`, `compliance.formulaAndMatching` | Matching percent lives under `formulaAndMatching.matching`. |
| Next step | `programWebPage`, `assistanceApplication.applicationProcedure.opportunityPostedURL` / `.URL`, `contacts.headquarters[]` | Posted-location fields can point at Grants.gov. |
| Similar awardees | **none** | Related programs only: `relatedFederalAssistance`. |

Useful type codes for retrieve (same page):

- Assistance: `F001` Grant, `F002` Cooperative Agreement, `F003` Direct Loan, `F004` Loan Guarantee.
- Applicants a startup might match: `ET41030` For-Profit Organization, `ET51120` Small Business Person, `ET11010` Unrestricted by Entity Type. Universities / governments are separate `ET*` codes; do not filter those in if the company is a for-profit.

### Retrieve query shape

There is **no keyword parameter**. Retrieve is filter-then-rank locally.

```http
GET https://api.sam.gov/assistance-listings/v1/search
  ?api_key={PUBLIC_KEY}
  &status=Active
  &assistanceTypes=F001
  &assistanceTypes=F002
  &applicantTypes=ET41030
  &pageSize=1000
  &pageNumber=0
```

By known ALN (join from Grants.gov `cfdaList`):

```http
GET .../search?api_key={PUBLIC_KEY}&assistanceListingId=93.855
```

Official example: `assistanceListingId=43.008` (prod) / `10.080` (alpha).

Match locally on `title`, `overview.objective`, `overview.assistanceListingDescription`, `overview.missionSubCategories`, `overview.subjectTerms` (v1.0). Do not expect the API to do "healthcare AI" search.

### Cache advice (~24h)

**Must cache before Friday.** Reasons: required key, 10/day without a Role, no keyword search, catalog is the product.

1. Create the SAM.gov personal account and Public API Key now. Add a Role if possible (1,000/day).
2. Thursday: page `status=Active` at `pageSize=1000` until `pageNumber == totalPages`. Store JSON as the weekend catalog.
3. Optional second dump: `applicantTypes=ET41030` and `ET51120` only, if the full Active set is large.
4. Do **not** call SAM from the demo request path. Join Grants.gov ALNs and USAspending `program_numbers` against the file.

I did not get `totalRecords` (no valid key). Unproven: exact page count. Budget as if it is several thousand Active rows (CFDA-scale), not millions.

### Gotchas

- Brief URL 404s. Use [assistance-listings-api](https://open.gsa.gov/api/assistance-listings-api/).
- Docs table for `applicantTypes` says "Refer to Eligible Beneficiary Types" and `beneficiaryTypes` says "Refer to Eligible Award Applicant Types". The code tables themselves are labeled correctly; use `ET41030` / `ET51120` from **Eligible Award Applicant Types**.
- Example JSON uses `missionSubCategories.primary` (lowercase) while the dictionary says `Primary`. Parse case-insensitively.
- `pageNumber` default is documented as 0; the worked example response shows `pageNumber: 1`. Do not assume 0- vs 1-based without a successful call.
- This API will not tell you who got the money. That is USAspending / SBIR.

---

## 3. USAspending V2

**Owners.** [api.usaspending.gov](https://api.usaspending.gov/), [docs index](https://api.usaspending.gov/docs/), [endpoints](https://api.usaspending.gov/docs/endpoints), [intro tutorial](https://api.usaspending.gov/docs/intro-tutorial), first-party contracts [spending_by_award.md](https://github.com/fedspendingtransparency/usaspending-api/blob/master/usaspending_api/api_contracts/contracts/v2/search/spending_by_award.md), [search_filters.md](https://github.com/fedspendingtransparency/usaspending-api/blob/master/usaspending_api/api_contracts/search_filters.md), live [award type groups](https://api.usaspending.gov/api/v2/references/award_types/).

V1 is deprecated. No authorization on current endpoints ([endpoints](https://api.usaspending.gov/docs/endpoints)).

### Auth

None.

### Rate limits

Not stated on the public API pages. First-party maintainer comment on [usaspending-api#4459](https://github.com/fedspendingtransparency/usaspending-api/issues/4459) (user `aguest-kc`, 2025): global cap of **1,000 requests in 300 seconds** on most endpoints; some endpoints are tighter. Over-limit behavior in the wild is empty replies / connection reset, not a clean 429. Status codes documented on the public page are 200 / 400 / 500 only.

For a 24h hackathon: stay well under 1,000/5 min. Serial, not 10-wide parallel. Cache fixture slices.

### What it returns (card mapping)

This is **historical awards**, not open opportunities. It owns the "similar awardees / history" slot.

Primary retrieve endpoint: `POST /api/v2/search/spending_by_award/`. `award_type_codes` is required. Default `limit` 10. Optional `page`, `order`, `sort`, `subawards`, `spending_level`.

Award-type codes ([live reference](https://api.usaspending.gov/api/v2/references/award_types/) + contract):

| Group | Codes to send |
|---|---|
| Grants | `02` Block, `03` Formula, `04` Project, `05` Cooperative Agreement |
| Contracts | `A` BPA Call, `B` Purchase Order, `C` Delivery Order, `D` Definitive Contract |
| IDVs | `IDV_A` … `IDV_E` |
| Loans | `07`, `08` |
| Direct payments | `06`, `10` |
| Other | `09`, `11`, `-1` |

Card fields (request them in `fields`; names are the display strings):

| Card | Field | Notes |
|---|---|---|
| Program | `CFDA Number`, `Assistance Listings`, `primary_assistance_listing`, `Description` | Assistance only. Contracts use `NAICS` / `PSC` instead. |
| Agency | `Awarding Agency`, `Awarding Sub Agency`, `Funding Agency` | Also `Awarding Agency Code`. |
| Value | `Award Amount` | Historical obligation, not a NOFO range. Loans: `Loan Value`, `Subsidy Cost`. |
| Deadline | **none** | `Start Date` / `End Date` are period of performance. `Issued Date` for loans. |
| Similar awardees | `Recipient Name`, `Recipient UEI`, `Recipient Location`, `recipient_id` | Location includes city, state, ZIP. |
| Join keys | `Award ID`, `generated_internal_id` | Detail: `GET /api/v2/awards/<generated_internal_id>/`. |

Live Utah + keywords `healthcare`/`SBIR` + grant types (level 4) returned formula HOPWA awards to state/city government, not startups. Keyword search is not "find SBIR companies." For similar *companies*, constrain `recipient_type_names`, `naics_codes`, and/or `program_numbers` (CFDA from the Grants.gov / SAM card).

Detail `GET /api/v2/awards/ASST_NON_UTH24F999_086/` (level 4) added `cfda_info[]` with `applicant_eligibility`, `beneficiary_eligibility`, `cfda_objectives` (useful concern text), `recipient.business_categories`, `funding_opportunity`, `period_of_performance`. `last_updated` on 2026-08-13 was `08/13/2026`.

Filters that matter for retrieve ([search_filters.md](https://github.com/fedspendingtransparency/usaspending-api/blob/master/usaspending_api/api_contracts/search_filters.md) + spending_by_award contract):

- `keywords[]` (legacy singular `keyword` is deprecated)
- `time_period[]` with `start_date` / `end_date` (`YYYY-MM-DD`). Search is limited to **FY2008+** (`2007-10-01`). Older data is download/bulk only.
- `recipient_locations[]` / `place_of_performance_locations[]` as `{ "country": "USA", "state": "UT" }`
- `agencies[]` `{ "type": "awarding"|"funding", "tier": "toptier"|"subtier", "name": "..." }`
- `program_numbers[]` (CFDA, e.g. `"93.855"`)
- `naics_codes` `{ "require": ["5415"], "exclude": [] }`
- `award_amounts[]` `{ "lower_bound", "upper_bound" }`
- `recipient_type_names[]`
- `recipient_search_text[]` (name / UEI / DUNS; documented max length 1)
- `award_ids[]`

### Retrieve query shape

Similar awardees for a Grants.gov / SAM card (by CFDA), Utah-weighted, last ~5 fiscal years:

```http
POST https://api.usaspending.gov/api/v2/search/spending_by_award/
```

```json
{
  "subawards": false,
  "limit": 10,
  "page": 1,
  "sort": "Award Amount",
  "order": "desc",
  "fields": [
    "Award ID",
    "Recipient Name",
    "Recipient UEI",
    "Recipient Location",
    "Start Date",
    "End Date",
    "Award Amount",
    "Awarding Agency",
    "Awarding Sub Agency",
    "Award Type",
    "CFDA Number",
    "Description",
    "generated_internal_id"
  ],
  "filters": {
    "award_type_codes": ["02", "03", "04", "05"],
    "program_numbers": ["93.855"],
    "recipient_locations": [{ "country": "USA", "state": "UT" }],
    "time_period": [{ "start_date": "2020-10-01", "end_date": "2026-09-30" }]
  }
}
```

If Utah returns empty, drop `recipient_locations` and keep the CFDA (national similar awardees). For defense / aero procurement cards, switch `award_type_codes` to `["A","B","C","D"]` and filter `naics_codes` instead of `program_numbers`.

Count first if you want a cheap "is this CFDA even awarded?" check: `POST /api/v2/search/spending_by_award_count/`.

### Cache advice (~24h)

Live search is viable (no key, 1k/5 min). Still pre-cache:

1. For each fixture, 1–2 `spending_by_award` pages: (a) Utah + keywords/NAICS, (b) CFDA list harvested from Grants.gov `cfdaList`.
2. Optional: one `spending_by_award_count` per fixture for the map header.
3. Do **not** bulk-download the national archive during the weekend. `POST /api/v2/download/awards/` and monthly files exist, but they are the wrong unit of work and are where people hit the undocumented extra limits.

Search time range: keep `start_date` >= `2007-10-01`.

### Gotchas

- `award_type_codes` is required on spending_by_award. Forgetting it is a 400.
- Keywords alone will surface formula grants to state agencies. That is correct USAspending behavior and a bad "similar company" list. Constrain type / NAICS / CFDA / recipient type.
- `recipient_search_text` "must not exceed a length of 1 item" in search_filters.md. Do not send a list of companies in one call.
- Detail path uses `generated_internal_id` (e.g. `ASST_NON_…`), not the numeric `internal_id`.
- This source cannot fill an Opportunity Map **deadline**.

---

## 4. SBIR.gov

**Owners.** Brief link [sbir.gov/data](https://www.sbir.gov/data) **404s**. First-party pages: [Data Resources](https://www.sbir.gov/data-resources), [Award API](https://www.sbir.gov/api), [Solicitation / Topic API](https://www.sbir.gov/api/solicitation), [Company API](https://www.sbir.gov/api/company), [Awards data dictionary](https://www.sbir.gov/data-resources/data-dictionary), [Topics data dictionary](https://www.sbir.gov/data-resources/data-dictionary/solicitation/topics).

Hosts: `https://api.www.sbir.gov/public/api/…` (JSON default; `format=xml` optional) and bulk files on `https://data.www.sbir.gov/…`.

### Auth

None documented. Public GET query params.

### Rate limits

No numeric HTTP rate limit is published. Pagination caps are the real constraint:

| Endpoint | Default rows | Max rows | Offset |
|---|---|---|---|
| Awards `/public/api/awards` | 100 | documented example 400; "set limits" | `start` |
| Solicitations `/public/api/solicitations` | 25 | **50** | `start` |
| Firms `/public/api/firm` | 100 | **5,000** | `start` |

Topic page downloads are capped at 10,000 rows at a time ([data-resources](https://www.sbir.gov/data-resources)).

### Current availability (weekend-critical)

All three API pages carry this banner (first-party, still up on 2026-08-13):

> Please be advised that the SBIR.gov APIs are currently undergoing maintenance.

Live GETs to awards / solicitations / firm on 2026-08-13 returned **HTTP 403** with and without a browser User-Agent (level 4).

Bulk award CSVs **did** respond to HEAD (level 4):

| File | HEAD |
|---|---|
| [award_data.csv](https://data.www.sbir.gov/awarddatapublic/award_data.csv) (with abstracts) | 200, 367,551,355 bytes |
| [award_data_no_abstract.csv](https://data.www.sbir.gov/mod_awarddatapublic_no_abstract/award_data_no_abstract.csv) | 200, 91,426,516 bytes |

**Treat the API as down until proven otherwise. Cache the CSVs before Friday.**

### What it returns (card mapping)

**Solicitations** (open opportunity):

Query: `keyword`, `agency`, `open=1`, `closed=1`. Fields: `solicitation_title`, `solicitation_number`, `program`, `phase`, `agency`, `branch`, `solicitation_year`, `release_date`, `open_date`, `close_date`, `application_due_date` (multiple), `occurrence_number`, `solicitation_agency_url`, `current_status`, `solicitation_topics[]` (`topic_title`, `topic_number`, `topic_description`, `sbir_topic_link`, `subtopics[]`).

| Card | Field |
|---|---|
| Program | `solicitation_title`, `topic_title`, `program` (`SBIR` / `STTR`), `phase` |
| Agency | `agency`, `branch` |
| Value | **absent** |
| Deadline | `close_date`, `application_due_date` |
| Why | `topic_description` |
| Next step | `solicitation_agency_url`, `sbir_topic_link` |

Documented agency tokens: `DOW` (Department of War), `HHS`, `NASA`, `NSF`, `DOE`, `USDA`, `EPA`, `DOC`, `ED`, `DOT`, `DHS`. There is **no `DOD` token** on the current page. Unproven: whether legacy `DOD` still matches.

**Awards** (similar awardees). Query: `agency`, `firm`, `year` (with agency), `ri`. API fields ([/api](https://www.sbir.gov/api) + [dictionary](https://www.sbir.gov/data-resources/data-dictionary)): `firm`, `award_title`, `agency`, `branch`, `phase`, `program`, `agency_tracking_number`, `contract`, `proposal_award_date`, `contract_end_date`, `solicitation_number`, `solicitation_year`, `topic_code`, `award_year`, `award_amount`, `duns`, `uei`, `hubzone_owned`, `socially_economically_disadvantaged`, `women_owned`, `number_employees`, `company_url`, address fields, `research_area_keywords`, `abstract`, `award_link`.

The dictionary lists extra columns on the **file download** that the API field list omits: `Solicitation_close_date`, `proposal_submitted_date`, `date_of_notification`. Official note: "more Award fields are available via the downloaded than the API."

| Card | Field |
|---|---|
| Program | `award_title`, `program`, `topic_code` |
| Agency | `agency`, `branch` |
| Value | `award_amount` |
| Similar awardees | `firm`, `city`, `state`, `number_employees`, `uei`, `abstract` |

**Companies:** `firm_nid`, `company_name`, `sbir_url`, `uei`, `duns`, address, flags, `number_awards`. Sort: `name` / `uei` / `state` (desc only).

### Retrieve query shape

If the API comes back:

```http
GET https://api.www.sbir.gov/public/api/solicitations?open=1&keyword=healthcare&rows=50
GET https://api.www.sbir.gov/public/api/solicitations?open=1&agency=HHS&rows=50
GET https://api.www.sbir.gov/public/api/awards?agency=HHS&year=2024&rows=100
GET https://api.www.sbir.gov/public/api/awards?firm=luna
GET https://api.www.sbir.gov/public/api/firm?keyword=utah&rows=100
```

Awards sort is awarded date desc and **cannot be changed**. Solicitations sort is close date desc, also fixed.

Weekend path if 403 persists: download `award_data.csv` (or the no-abstract file plus on-demand abstracts), plus a topics CSV from [sbir.gov/topics](https://www.sbir.gov/topics) in 10k chunks. Filter locally by `agency`, `state=UT`, `research_area_keywords` / `abstract`, `program`.

### Cache advice (~24h)

**Must cache before Friday.**

1. Download [award_data.csv](https://data.www.sbir.gov/awarddatapublic/award_data.csv) (~351 MB). Keep abstracts; they are the similar-company "why."
2. If the solicitation API is still 403, download Open topics from the topics UI (10k cap).
3. Do not depend on `api.www.sbir.gov` in the request path until a live 200 is recorded.
4. Helpdesk listed on the API pages: `sba.sbir.support@decisionpointcorp.com`, Mon–Fri 9:00–5:00 ET. Useless Saturday.

### Gotchas

- Brief `/data` URL 404s. Use `/data-resources` and `/api`.
- Maintenance banner + live 403. Plan B is the CSV, not retries.
- Agency list says `DOW`, not `DOD`.
- Solicitations max 50 rows. Awards default 100. Do not assume one page is complete.
- API awards omit some dictionary dates; CSV is richer.
- No award-amount field on solicitations. Phase I/II typical sizes are not in this API; do not invent them.

---

## Card join map (retrieve, not rank)

One Opportunity Map card is a join, not a single payload.

```
Grants.gov search2 hit
  ├─ program/agency/deadline  ← search2
  ├─ value/eligibility/why    ← fetchOpportunity (awardCeiling may be "none")
  ├─ program description      ← SAM by assistanceListingId == cfdaList[]
  └─ similar awardees         ← USAspending program_numbers[] == CFDA
                               ← and/or SBIR awards by agency + keywords
```

SBIR-shaped cards (NIH/NSF/DOW/DOE parent SBIR, or sbir.gov open topics):

```
SBIR solicitation / Grants.gov SBIR NOFO
  ├─ deadline                 ← SBIR close_date or Grants.gov closeDate
  ├─ value                    ← usually missing; say so
  └─ similar awardees         ← SBIR awards CSV (firm, state, amount, abstract)
                               ← USAspending is a weaker backup here
```

SAM-only rows (no current Grants.gov hit): allowed as "program exists, no open NOFO" / adjacent. Deadline and value are weak. History still comes from USAspending `program_numbers`.

---

## Weekend-safe cache (must vs nice)

Clock: official build window Fri 1:30 PM–Sat 2:00 PM. Cache **Thursday**.

| Priority | What | Why | How |
|---|---|---|---|
| **Must** | SAM Active listings JSON | Key + 10/day without Role; no keyword search | Page `status=Active&pageSize=1000` after creating a key (Role if possible). Commit or vendor the file. Zero live SAM calls on Friday. |
| **Must** | SBIR `award_data.csv` | API maintenance + live 403 | HEAD already 200. Download the-with-abstracts file. Optional: topics CSV. |
| **Must** | Grants.gov posted+forecasted slice for the five fixtures | search2 has no value field; 429 is real | ~2 search2 queries per fixture (with/without `eligibilities=23`) + fetchOpportunity for each kept `id`. Hundreds of rows, not tens of thousands. |
| **Should** | USAspending slices | Empty-reply rate limit; keyword noise | Per fixture: CFDA list from Grants.gov, Utah + national, grants and (for aero/cyber) contracts+NAICS. `limit` 10–25. |
| **Skip** | Full USAspending bulk download, SAM Inactive, Grants.gov archived, live SBIR paging | Wrong unit of work; burns the weekend | Brief already says do not ingest everything. |

Auth work to do **before** Friday, not during:

1. SAM.gov personal account + Public API Key + a Role if you can get one (moves 10/day → 1,000/day).
2. No Grants.gov Help Desk key needed for search2/fetchOpportunity.
3. No USAspending key.
4. No SBIR key. If the API is still 403 Friday, do not wait on `sba.sbir.support@decisionpointcorp.com`.

---

## Suggested retrieve queries (by fixture lane)

These are query **shapes**, not ranked results.

| Fixture | Grants.gov search2 | SAM (against cache) | USAspending | SBIR (against CSV / API if up) |
|---|---|---|---|---|
| 1 AI healthcare | `keyword` healthcare / SBIR / NIH; `fundingCategories=HL`; `eligibilities=23` | ALN from hits; `assistanceTypes=F001,F002`; applicant `ET41030`/`ET51120` | `program_numbers` from CFDA list; also `keywords` + NAICS 5415/5417; Utah then national | `agency=HHS` or `NSF`; keyword health/AI |
| 2 Aero manufacturing | keywords aerospace / SBIR / NASA / manufacturing; `ST` | same type filters; join ALN | contracts `A–D` + NAICS 3364; grants to NASA/DOE | `agency=NASA` or `DOW` |
| 3 Water / climate | water, climate, sensor; `ENV`/`EN` | EPA/DOE orgs if `organizationCodes` known | `keywords` + EPA/DOE agencies; Utah | `agency=EPA` / `DOE` |
| 4 Cyber | cyber, SBIR; `ST` | DHS/DOW ALNs | contracts + NAICS 5415; `agency` DHS | `agency=DHS` / `DOW` |
| 5 Parent/youth marketplace | workforce, youth, education; `ELT`/`ED`; expect thin posted+forecast | many programs will fail for-profit applicant types | if hits look like formula grants to states, that is a "no" signal | likely empty or off-mission; do not force a card |

Case 5: empty or government-only SAM applicant types + formula-grant-only USAspending is evidence to say "no strong federal grant," not a prompt to loosen keywords until something appears.

---

## What is still unproven

- Grants.gov numeric rate limit (only 429 + backoff is documented).
- SAM `totalRecords` and whether `pageNumber` is 0- or 1-based (no valid key in this session; live unauthenticated GET was 404).
- Whether a no-Role SAM key can finish a full Active dump in 10 calls (`pageSize=1000`).
- SBIR API return-to-service time. 403 + maintenance banner are current facts.
- Whether SBIR `agency=DOD` still works, or only `DOW`.
- Exact USAspending global limiter implementation (staff comment, not the public guide).
- fetchOpportunity fields on a **forecast** `docType` (live detail pull was a posted synopsis). Forecasts may put dates under `forecast` instead of `synopsis`.

---

## Source list

- Grants.gov: [API guide](https://www.grants.gov/api/api-guide), [search2](https://www.grants.gov/api/common/search2), [fetchOpportunity](https://www.grants.gov/api/common/fetchopportunity), [status codes](https://www.grants.gov/api/status-codes), [versioning](https://www.grants.gov/api/api-versioning). Live `POST https://api.grants.gov/v1/api/search2` and `fetchOpportunity` on 2026-08-13.
- SAM: [Assistance Listings Public API](https://open.gsa.gov/api/assistance-listings-api/) (brief URL 404s). Live unauthenticated GET → 404.
- USAspending: [API home](https://api.usaspending.gov/), [endpoints](https://api.usaspending.gov/docs/endpoints), [intro](https://api.usaspending.gov/docs/intro-tutorial), [spending_by_award contract](https://github.com/fedspendingtransparency/usaspending-api/blob/master/usaspending_api/api_contracts/contracts/v2/search/spending_by_award.md), [search filters](https://github.com/fedspendingtransparency/usaspending-api/blob/master/usaspending_api/api_contracts/search_filters.md), [award types](https://api.usaspending.gov/api/v2/references/award_types/), [issue #4459](https://github.com/fedspendingtransparency/usaspending-api/issues/4459). Live search + award detail + `last_updated` on 2026-08-13.
- SBIR: [data-resources](https://www.sbir.gov/data-resources), [awards API](https://www.sbir.gov/api), [solicitations API](https://www.sbir.gov/api/solicitation), [company API](https://www.sbir.gov/api/company), [awards dictionary](https://www.sbir.gov/data-resources/data-dictionary), [topics dictionary](https://www.sbir.gov/data-resources/data-dictionary/solicitation/topics). Live API GET → 403; CSV HEAD → 200.
