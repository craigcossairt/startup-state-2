# GOEO table categories

**Date:** 2026-08-13
**Ticket:** [GOEO table categories](https://github.com/craigcossairt/startup-state-2/issues/6)
**Map:** [Lock the Government Opportunity Finder spec](https://github.com/craigcossairt/startup-state-2/issues/1)

## Verdict

The 213-row Part 1 table is a Utah **directory**, not an opportunity catalog. Source `topics` cannot drive retrieve: `Funding` is on 151 rows (chambers, events, campus centers, private VC), and the two rows that actually serve this product sit in **different** topics. Retrieve has to be a small, title-and-description-derived program-type set. Chips widen. Default view is the retrieved slice, not all 213.

The two clearest State-lane rows remain **Utah Innovation Center** (SBIR/STTR proposal help) and **APEX Accelerator** (government contracting). A Texas company may still fit some rows, but the JSON has **no** nonresident-open flag. Treat unknown Utah-only programs as `adjacent` plus a concern, except national programs that merely live in this table (SBA, SCORE, EDA, U.S. Commercial Service).

## Sources and method

Read-only Part 1 clone. Counts are from the JSON itself (213 objects). Program-type labels below are read from `title` + `description`, not invented as new source fields.

| What | Path |
|---|---|
| Catalog | `C:\Users\Craig Cossairt\startup-state\data\resources.json` (213 objects) |
| Schema + scoring | `C:\Users\Craig Cossairt\startup-state\src\lib\matching.ts` |
| Directory UI (all 213, topic/community filters) | `C:\Users\Craig Cossairt\startup-state\src\components\resources\resource-directory.tsx` |
| Allowed topic list (retag script) | `C:\Users\Craig Cossairt\startup-state\scripts\retag.ts` (`TOPICS`, lines 50–61) |
| Data-quality notes | `C:\Users\Craig Cossairt\startup-state\CONTEXT.md` (Resources `Industries` / `Locations` are mostly noise) |
| Origin spreadsheet | `C:\Users\Craig Cossairt\startup-state\Resources List - Builder Day.xlsx` (ingest source named in CONTEXT.md) |

Each row has: `external_id`, `title`, `description`, `communities`, `industries`, `locations`, `topics`, `link`, `email`. No program-type field. No residency / nonresident field. Two titles are empty-link; 56 have no email. Two titles are duplicated (`Bear River Association of Governments`, `Five County Association of Governments`).

Certainty: histograms are a run against the JSON (level 4). Program-type buckets are title/description reads (level 2). Residency is a negative search of the same text (level 2).

## Topic histogram (source field)

Every row has at least one topic. Ten distinct values, the same closed list as `scripts/retag.ts`.

| Topic | Rows | Share of 213 |
|---|---:|---:|
| Entrepreneurship Communities | 163 | 77% |
| Funding | 151 | 71% |
| Late Stage Growth | 123 | 58% |
| Start a Business | 57 | 27% |
| Marketing and Sales | 47 | 22% |
| Other | 39 | 18% |
| Close or Exit a Business | 26 | 12% |
| International Trade | 26 | 12% |
| Relocate a Business to Utah | 25 | 12% |
| Taxes and Finance | 24 | 11% |

Topics per row: 1 topic = 60, 2 = 30, 3 = 75, 4 = 24, **all 10 = 24**.

The 24 all-tagged rows are a spray, not a taxonomy. They include campus BRCs, `EVENT:` summits, `StartUp State`, `Small Business Development Center (SBDC)`, `Utah Governor's Office of Economic Opportunity`, `Wildcat MicroFund`, and `Vision Iron County`. `Relocate a Business to Utah` is on 25 rows; 24 of those are this all-10 set. The only Relocate row that is not all-10 is `Altitude Labs`. Relocate is inbound-to-Utah tagging, not a nonresident-open signal.

Dominant topic-set shapes:

| Count | Topic set |
|---:|---|
| 68 | Entrepreneurship Communities + Funding + Late Stage Growth |
| 24 | all 10 topics |
| 22 | Funding only |
| 21 | Entrepreneurship Communities + Funding + Marketing and Sales + Start a Business |
| 19 | Entrepreneurship Communities only |
| 13 | Entrepreneurship Communities + Late Stage Growth |
| 10 | Late Stage Growth only |

Part 1 scoring treats topic as the primary signal (`GOAL_TOPICS` in `matching.ts` lines 41–47). `Find funding` maps to `["Funding"]` only. That would retrieve 151 rows and **miss APEX**, which is tagged `Late Stage Growth` only.

**Do not retrieve on source topics.** They describe the GOEO website IA, then got over-applied.

## Community histogram (source field)

| Community | Rows tagged |
|---|---:|
| *(empty)* | 144 |
| Any | 22 |
| Rural | 20 |
| Multicultural | 20 |
| Student | 18 |
| Women | 14 |
| Veteran | 11 |
| New American | 8 |

Empty on 144/213 (68%). Only-`Any` on 17 rows. A real community tag (not empty, not only `Any`) on **52** rows. Eight rows dump six or seven community values at once (`SBA`, `SBDC`, `StartUp State`, `SCORE`, `SBA Thrive`, `Get Started`, GOEO, Offices.net). Those are "all audiences," not a differentiator.

`matching.ts` (lines 130–147) gives community weight 4 when the persona declares one, and a 0.5 / 0.2 consolation for `Any`. That is the right *chip* behavior. It is the wrong *retrieve* key: most government-opportunity rows (Innovation Center, APEX, USBCI, DWS, the loan funds) have **empty** communities.

Student (18) is almost entirely campus entrepreneurship centers. Women / Veteran / Multicultural mark real orgs when the list is short (Women's Business Center, VBRC, Suazo, identity chambers). Rural mixes real programs (Utah Center for Rural Development, UDAF) with local events and `A-Tech home plans`.

**Community is a widen-chip, not a retrieve category.**

## Industry and location (do not retrieve on these)

`CONTEXT.md` already called industries noise. Confirmed: **175/213 (82%)** are tagged with all 10 industries. `matching.ts` lines 149–160 only scores industry when the row has 1–3 tags. Utah Innovation Center is one of the few carefully tagged rows (5 industries: Aerospace and Defense, Agriculture, Life Sciences and Healthcare, Manufacturing, Software and Information Technology). APEX is all 10.

Locations: 95 rows list all 29 counties (statewide). 114 list 1–8 counties (the Part 1 directory hides these when they miss the persona region; `resource-directory.tsx` lines 81–92). 4 are partial (9–28). Location is a geography chip, not a program type.

## The two clearest rows

### Utah Innovation Center

- `external_id` 2654, link `https://business.utah.gov/innovation/`
- Topics: **`Funding` only**. Communities: none. Locations: all 29 counties.
- Description (verbatim sense): GOEO program. Funding roadmap for startups developing innovative technologies. Proposal review, training, mentoring to help secure **non-dilutive federal SBIR / STTR**.
- Only row whose title or description mentions SBIR or STTR.
- This is the State-lane companion when federal retrieve is R&D / SBIR / non-dilutive.
- Campus rows that also say "Innovation Center" (Atwood, SUU BIC, UVU Innovation Academy, Escalante City) are coworking / BRC / student spaces. Do not collapse them into this row.

### APEX Accelerator

- `external_id` 2646, link `https://business.utah.gov/apex/`
- Topics: **`Late Stage Growth` only**. Not Funding. Communities: none. Locations: all 29 counties. Industries: all 10.
- Description: formerly PTAC. "Assists **Utah businesses**" with federal, state, and local government contracts. Counseling, workshops, bid opportunities, defense industrial base.
- Only row that names APEX, PTAC, or "procurement technical."
- Four other rows mention "contract" (two BRCs, Atwood, SBA). Those are not APEX.
- This is the State-lane companion when federal retrieve is procurement / SAM / DoD vendor.

A retrieve that is "Funding-tagged rows" keeps Innovation Center, drops APEX, and dumps 150 neighbors. That is the failure mode this ticket exists to prevent.

## Funding-tagged rows (151)

`Funding` is the largest *named* topic after Entrepreneurship Communities, and the one Part 1 maps to "Find funding." It is not a money program list.

Of the **22 Funding-only** rows (the cleanest slice of the tag):

| Kind | Count | Titles |
|---|---:|---|
| SBIR help | 1 | Utah Innovation Center (tagged Funding; it is proposal help, not a check) |
| State / public capital | 6 | Utah Innovation Fund; USBCI; UMLF; Mountain Land AOG RLF; SE Utah RLF; R6 RLF |
| Private VC / angels / PE | 15 | Pitted, Signal Peak, Album, Epic, Convoi, Pelion, Grix, Tandem, Peterson, Kickstart Fund, Red Rock Angels, Salt Lake Angels, Park City Angels, RevRoad, Startup Ignition Ventures |

So even the *strict* Funding tag is majority private capital, which is not a government opportunity.

The other 129 Funding rows are mostly the 68-row "communities + funding + late stage" blob (local chambers and county EDOs) plus the 24 all-10 dump plus campus centers. A Funding chip that means "this row has the Funding topic" will recreate last year's directory.

Public-capital rows that *are* government-adjacent, whether or not the tag is clean:

- USBCI (`business.utah.gov/usbci/`) — GOEO small-business credit, statewide
- Utah Innovation Fund — state VC for commercializing Utah higher-ed tech
- UMLF — CDFI microloans, underserved Utah founders
- Three regional Revolving Loan Funds (Mountainland / SEUALG / R6)
- Wildcat MicroFund — Weber State milestone grants up to $3,000 (all-10 tagged)
- Get Started: Business Idea Challenge — "Utah residents," up to $500 (`startup.utah.gov/get-started/`)
- Utah Center for Rural Development — RCOG, REDI, Enterprise Zone credits (topics are *not* Funding; they are Entrepreneurship Communities / Late Stage Growth / Other)

## Obvious program types (from titles, not from topics)

Title-pattern counts, no new fields invented:

| Pattern in `title` | Count | Default map? |
|---|---:|---|
| `Chamber` | 34 | No. Local directory. |
| `Economic Development` | 22 | No. City/county EDO directory. |
| `Association of Governments` / `Association of Local Governments` | 10 (2 titles duplicated) | No, except the three named RLF programs. |
| `EVENT:` prefix | 8 | No. |
| `Ventures` / `Angels` / `Fund` in title | 20 | Only the public ones (UMLF, RLFs, USBCI, Innovation Fund, Wildcat MicroFund, Kickstart is private). |
| `Innovation Center` in title | 5 | Only **Utah Innovation Center**. The other four are campus / city spaces. |

Description-supported types that the topic field does *not* isolate:

| Type | Clear rows | Source topic they actually have |
|---|---|---|
| SBIR / proposal help | Utah Innovation Center | Funding |
| Gov contracting | APEX Accelerator | Late Stage Growth |
| Workforce / training | DWS, Talent Ready Utah, Apprenticeship Utah, Custom Fit, Weber Basin Job Corps, Clearfield Job Corps, Utah MEP, USU Remote Online Initiative | Late Stage Growth only (10 rows total share that exclusive tag, including APEX, SBA Thrive, Goldman Sachs 1000) |
| Trade / export | World Trade Center Utah, U.S. Commercial Service, STOPfakes.gov | mixed; WTC is Communities + Late Stage, not International Trade |
| Counseling portals | SBDC, SCORE, SBA, SBA Thrive, Women's Business Center, VBRC / STRIVE, Suazo (title is the whole description) | mixed; SBDC is all-10 |
| Coworking / space | ~12 cowork / makerspace titles (Kiln, Work Hive, Offices.net, …) | Entrepreneurship Communities |
| National programs parked in the Utah table | SBA, SCORE, Federal EDA, U.S. Commercial Service, STOPfakes.gov, SBA Thrive, Goldman Sachs 1000 Small businesses | mixed |

`World Trade Center Utah` is tagged Entrepreneurship Communities + Late Stage Growth, not International Trade. `Federal Economic Development Administration` is tagged `Other` + Rural. Source topics will not retrieve the types a founder means.

## Proposed retrieve categories

Six retrieve keys, derived from title + description (and, for the two anchors, `external_id`). Not from `topics`. Keep the labels short enough to be chips.

| Retrieve key | What it matches in this table | When the company profile retrieves it | Approx rows if conservative |
|---|---|---|---:|
| `sbir-help` | Utah Innovation Center only | R&D, SBIR/STTR, non-dilutive, deep tech | 1 |
| `contracting` | APEX Accelerator only | Procurement, SAM, government customer, DoD vendor | 1 |
| `state-capital` | USBCI, Innovation Fund, UMLF, 3 RLFs, Wildcat MicroFund, Get Started, Rural Development incentives | Capital need, credit, milestone grant | ~9 |
| `workforce` | DWS, Talent Ready, Apprenticeship Utah, Custom Fit, both Job Corps, Utah MEP, USU Remote Online | Hire, training, manufacturing scale | ~8 |
| `counseling` | SBDC, SCORE, SBA, WBC, VBRC, Suazo, StartUp State | Case 5; "who do I talk to"; early / general | ~7 |
| `trade` | WTC Utah, U.S. Commercial Service, STOPfakes.gov | Export, international, foreign customer | 3 |

That is ~30 rows in the union if every key fires, and **1–10 in a typical retrieve**. Default map = union of keys the profile actually fired. Not 151 Funding rows. Not 213.

Rules that keep this from becoming a directory:

1. **Never retrieve on source `topics`, `industries`, or `communities` alone.**
2. **Never retrieve chambers, `EVENT:` rows, campus Innovation Centers, coworking, private VC/angels, or city/county EDOs by default.** Those exist for a "widen to directory" chip, not for first paint.
3. **Private capital stays out of `state-capital`.** Kickstart, Pelion, angels, RevRoad are not government opportunities. A later "Utah investors" chip can show them; they are not the State lane.
4. **Campus "Innovation Center" ≠ Utah Innovation Center.** Match `external_id` 2654 or the exact title + `business.utah.gov/innovation/`.
5. **One row can have more than one retrieve key** (SBA is counseling and mentions contracting; do not promote it to `contracting` — APEX owns that key).
6. **Community overlay is a chip, not a seventh default key.** If the persona is Veteran, also show VBRC / STRIVE / Veteran-Owned Business Registration. Same for Women (WBC, LiaLaunch, Maven CREATE) and Multicultural (Suazo, identity chambers). Do not show those 34 chambers to everyone.

User chips on the map (widen; already locked at the product level as lane / category / Fit / agency):

| Chip | Values the data can support |
|---|---|
| Lane | Federal / Utah |
| Category | the six retrieve keys above, plus `directory` (the leftover ~180) |
| Fit | likely / potential-verify / adjacent / probably not |
| Community | Women / Veteran / Student / Multicultural / New American / Rural — only when the row has that tag |
| Geography | statewide (29 counties) vs county-specific (1–8) |
| Agency | GOEO (`business.utah.gov` / `startup.utah.gov`), SBA, university, local |

`directory` is an explicit opt-in so a judge can see we ingested the table without making the default map last year's `/resources` page.

## Companion vs case-5 fallback vs noise

Locked product fact: State-lane rows either sit next to a federal match (companion) or are the honest answer when federal is weak (case 5). Everything else is noise unless the user chips into it.

### Companion-to-federal (retrieve with a live federal card)

| Row | Sits next to |
|---|---|
| Utah Innovation Center | SBIR/STTR, NSF Seed Fund, NIH/HHS R&D, any non-dilutive proposal |
| APEX Accelerator | SAM / procurement / DoD / NASA vendor paths |
| USBCI, Utah Innovation Fund | A capital-need federal grant, as a Utah credit / state-VC next step |
| Utah MEP, Custom Fit, Talent Ready | Manufacturing / aerospace / workforce federal programs |
| World Trade Center Utah, U.S. Commercial Service | Export / international federal programs |

### Case-5 fallback (federal grants are a poor fit)

Test case 5 is a parent/youth-activities marketplace. The honest federal answer is "probably not." Utah next steps that the table can actually support, without hallucinating a grant:

- SBA, SBDC, SCORE — counseling, not a fake grant
- Get Started: Business Idea Challenge — $500, **Utah residents**
- Utah Microloan Fund — small credit, underserved founders
- DWS — hiring, not a grant
- Women's Business Center / Suazo / VBRC — only if the persona matches
- StartUp State portal — orientation, not money

Do not offer Innovation Center or APEX as the case-5 hero. They are the wrong type.

### Noise (in the table, out of the default retrieve)

- 34 chambers
- 22 `Economic Development` offices + most AOGs / alliances / ULCT / UAC
- 8 `EVENT:` rows, farmers markets, 1 Million Cups
- Campus / city Innovation Centers, BRCs, incubators, coworking, Offices.net, "Salt Lake City Office Space for Rent"
- Private VC, angels, PE, RevRoad, Kinect Capital
- Tourism / film / outdoor-recreation orgs unless the profile is that industry *and* the user chips directory
- `A-Tech home plans`, `Ai Seminar for Small Businesses &amp; Non-Profits`, the Suazo row whose **title is the entire description**
- The two duplicate AOG titles

This leftover is the `directory` chip, not the Opportunity Map.

## Nonresident-open signal

Question: can a row apply to a company outside Utah?

**The JSON cannot answer yes for Utah programs.** There is no residency field. A case-insensitive scan of every `title` + `description` found:

- 0 hits for `nonresident`, `out of state`, `out-of-state`, `outside utah`, `nationwide`, `any state`, `not limited to utah`, `utah only`, `must be`, `located in utah`, `eligibility`
- 1 hit for `eligible` (Uinta Basin Association of Governments; not a residency rule)
- 1 hit for `open to` (`EVENT: Utah Tech Week`)
- 7 hits for `utah-based` (private funds and `A-Tech home plans`)
- 2 hits for `relocat` in body text: **EDCUtah** ("relocate or expand their operations in Utah") and Sevier County Economic Development

What the descriptions *do* say:

| Row | Residency language |
|---|---|
| APEX Accelerator | "assists **Utah businesses**" |
| Get Started: Business Idea Challenge | "**Utah residents**" |
| Utah Innovation Center | "catalyst for technology innovation **in Utah**" — no explicit nonresident clause, no invitation either |
| Utah Innovation Fund | commercializing tech from **Utah higher-ed** |
| UMLF, RLFs, USBCI, Wildcat, Custom Fit, DWS, Rural Development | Utah geography assumed; no extra-state offer |
| EDCUtah | inbound **relocation to Utah** — a Texas company that will move, not a remote applicant |

What *can* apply outside Utah is not a Utah program at all. These are national rows that happen to sit in the GOEO table:

- Small Business Administration (SBA)
- SCORE
- Federal Economic Development Administration
- U.S. Commercial Service (export of *U.S.* products; the Utah page is a field office)
- STOPfakes.gov
- SBA Thrive
- Goldman Sachs 1000 Small businesses

Locked product rule still holds: a Texas company can rank a Utah program when we **know** it allows nonresidents; otherwise `adjacent` plus a concern. After this pass, "we know" is almost never true for Utah-administered rows. APEX and Get Started are explicit Utah-bound. Innovation Center is unknown, so adjacent + concern, not a hide and not a `likely`.

`Relocate a Business to Utah` is not a substitute flag. 24/25 of those tags are the all-10 spray.

## What not to lift from Part 1 matching

Already listed in `docs/briefs/startup-state-reuse.md`. Confirmed by this count:

- `GOAL_TOPICS` / `STAGE_TOPICS` (`matching.ts` 41–55) — they point at the dirty topic field
- The `/resources` directory pattern (`resource-directory.tsx`) — search + topic + community over all 213
- Industry as a retrieve key — 175 rows are all-tagged
- Treating every `Innovation Center` string as the GOEO SBIR desk

Reason chips as UX (why this card) still lift. The weights do not.

## Spec implication (one paragraph)

State lane uses the larger GOEO table. Retrieve is the six keys above, fired from the company profile. Default map is that retrieved set. Chips (lane, category, Fit, community, geography, agency, and an explicit `directory`) widen. Utah Innovation Center and APEX are the two always-explainable examples. Funding-the-topic is not a category. A Texas company sees national rows as ordinary federal-capable cards, and Utah-administered rows as `adjacent` plus a concern unless a later pass finds a real nonresident rule (this table does not contain one).
