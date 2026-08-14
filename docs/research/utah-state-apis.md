# Utah state APIs and bulk data (State lane)

**Ticket:** [Utah state APIs](https://github.com/craigcossairt/startup-state-2/issues/10)  
**Map:** [Lock the Government Opportunity Finder spec](https://github.com/craigcossairt/startup-state-2/issues/1)  
**Pulled:** 2026-08-13 (machine-local, America/Denver)  
**Scope:** official `.gov` / `.edu` docs, open-data portals, first-party APIs. No blog recaps.  
**Not in scope:** federal discovery (required core). This note only asks what exists *beyond* the Part 1 GOEO table.

Certainty: endpoint existence and “no public API” claims were **run** (HTTP GET against live hosts). Program rules, windows, and eligibility are **pointed at the official page**. Live U3P bid *rows* were not enumerated (portal is JS; no published list API).

---

## Answer

There is **no Utah Grants.gov**. No official state, GOEO, university, or local API returns current opportunities as structured rows a founder can match the way Grants.gov / SAM / USAspending / SBIR.gov do.

What exists for a State lane:

1. **Standing program pages** (HTML + PDF + a Salesforce apply portal). These can fill Opportunity Map cards if we curate them. They do not give us a live feed.
2. **Two official structured feeds that are not opportunity APIs:** the Startup State resource CSV (same 213-row directory as Part 1) and GOEO’s WordPress Events Calendar REST endpoint (grant *windows*, not program records).
3. **One live procurement portal** (U3P on Bonfire). Public to browse. Vendor login to bid. **No published public API.** Machine use would be scrape-only.
4. **Open data is a miss for this product.** `opendata.utah.gov` is decommissioned. UGRC / SGID is GIS. Transparent.utah.gov is spending, not solicitations.

Federal discovery stays the required core. Utah is still an advantage if we **curate** 8–15 GOEO / Nucleus / USBCI / APEX / U3P cards and use the Events Calendar as a window-refresh signal. Do not plan a Utah ingest pipeline that looks like the federal stack.

---

## What Part 1 already has

Part 1 `C:\Users\Craig Cossairt\startup-state\data\resources.json` is **213 organizations**, not current opportunities.

| Field | Present? |
|---|---|
| title, description, link, email | yes |
| topics, industries, locations, communities | yes (multi-select tags) |
| program / agency / value / deadline / next step | **no** |
| live windows | **no** |

Topics are catalog tags (`Funding` = 151 of 213), not “this grant is open until Friday.” Rows include coworking spaces, VCs, chambers, events, and federal pointers (SBA, EDA) mixed with GOEO programs. APEX and the old “Utah Innovation Center” URL are in the table as orgs.

That file is a snapshot of the official Startup State export. Fetched 2026-08-13:

- [startup.utah.gov/resources](https://startup.utah.gov/resources/) advertises **Download Resources List**.
- The download is a WP All Export CSV: `https://startup.utah.gov/wp-load.php?security_token=…&export_id=2&action=get_data` → `current-Business-Resources-Export.csv`.
- Live export: **213 rows**, same columns (`id, Title, description, Communities, Industries, Locations, Topics, link, email`), same first titles as Part 1.

So refreshing the Part 1 table gives us a **current directory**, not current opportunities. The tokenized export URL is a convenience dump, not a documented API, and can rotate.

---

## Scorecard

| Source | Kind | Auth | Current enough for a Map card? | Texas / out-of-Utah company? |
|---|---|---|---|---|
| [startup.utah.gov](https://startup.utah.gov/resources/) CSV + WP REST | directory dump + CMS | public GET | No (orgs, not windows) | Directory lists Utah orgs; some national (SBA) |
| [business.utah.gov/grants](https://business.utah.gov/grants/) | HTML program index | none | **Yes, if curated** | Mix (see programs) |
| Events Calendar REST | grant *windows* | public GET | Partial (2 future events on fetch) | Same as the linked program |
| GOEO Salesforce (`goed.my.salesforce-sites.com/econ`) | apply portal | login | No (applications, not discovery) | N/A |
| Nucleus Grow + [UTIF](https://www.nucleusutah.org/utif) | HTML + PDF + Salesforce | public read / login to apply | **Yes** (standing SBIR companion) | **No** (Utah HQ / Utah registration) |
| [Nucleus Fund](https://www.nucleusfundutah.com/) | apply form | form | Weak (equity fund, not a dated grant) | Only with Utah university IP |
| [USBCI](https://business.utah.gov/usbci/) | HTML + PDF policies | none | **Yes** (standing loans) | **No** (Utah small businesses) |
| REDI / EAG / EDTIF / rural grants | HTML + PDF | Salesforce to apply | **Yes** (dated or standing) | See program rows |
| [U3P Bonfire](https://utah.bonfirehub.com/portal/?tab=openOpportunities) | live bids portal | browse public; bid needs register | **Yes** (real solicitations) | **Usually yes** (any qualified vendor) |
| [statecontracts.utah.gov](https://statecontracts.utah.gov/Home/Search) | awarded contract search | public HTML | No (already awarded) | Re-solicitations later, not a card feed |
| [APEX](https://business.utah.gov/apex/) | counseling | client signup | Card as *next step*, not a bid feed | Utah county signup |
| `opendata.utah.gov` | **decommissioned** | — | No | — |
| UGRC / [opendata.gis.utah.gov](https://opendata.gis.utah.gov/) | GIS APIs | public | No (not opportunities) | N/A |
| GOPB “Funding Portal” | Looker dashboard | public view | Human search only | Mixed |
| UDAF / Outdoor Rec / Broadband | HTML grant pages | none / Salesforce | Sometimes | Usually Utah communities / producers |
| U of U / USU / BYU TLO | licensing catalogs + SBIR help | public HTML | Licensing, not state grants | Licensing: yes. SBIR help: Utah / campus |

---

## 1. Startup State and GOEO sites

### 1.1 [startup.utah.gov](https://startup.utah.gov/)

GOEO’s Startup State Initiative site. Marketing + 19-step journey + resource filter. **No opportunity API.**

- [Resources](https://startup.utah.gov/resources/) is the same filter/export as Part 1.
- [Fund Your Small Business](https://startup.utah.gov/fund-small-business/) and [Growth Stage Funding](https://startup.utah.gov/growth-funding/) are link lists to GOEO grants, tax incentives, Nucleus Grow, USBCI, Utah Innovation Fund, Grants.gov.
- [Obtain Government Contracts](https://startup.utah.gov/government-contracts-2/) points at APEX and SBA. No bid feed.
- WordPress REST is on: `https://startup.utah.gov/wp-json/` (public GET). Types are posts/pages, not resources. Ninja Tables namespace exists; it is plugin plumbing, not a documented catalog API.
- Auth: none for GET. Application Passwords exist for WP write, irrelevant here.
- Rate limits / TOS: no GOEO-published API TOS. Site sits under [Utah.gov Terms of Use](https://www.utah.gov/disclaimer.html) (as-is public service; personal/informational copy allowed if unmodified; no warranty; Utah law).
- **Scrape-only?** The official CSV is a first-party download. HTML filter is a page, not an API.

### 1.2 [business.utah.gov](https://business.utah.gov/) (GOEO)

`goed.utah.gov` does not resolve. The live office site is `business.utah.gov` (title still says Governor's Office of Economic Development).

- Home “Featured Opportunities” → [Grants](https://business.utah.gov/grants/).
- [Grants & Funding Sources](https://business.utah.gov/grants/) is the **best official index** of current/coming GOEO money. It names windows and points at program pages + a [Grants Calendar](https://business.utah.gov/events/category/grants/list/).
- Apply path for most GOEO grants: [Salesforce Experience Cloud](https://goed.my.salesforce-sites.com/econ/PtlCase) (new-user request, ~1 business day). Login portal, **not** a public list API.
- WordPress REST is on: `https://business.utah.gov/wp-json/`. The Events Calendar plugin exposes a real public JSON API (below).
- `https://business.utah.gov/innovation/` **redirects** to [nucleusutah.org/grow](https://www.nucleusutah.org/grow). The Part 1 “Utah Innovation Center” URL is stale.

### 1.3 Events Calendar REST (only near-API for GOEO windows)

**Endpoint (run 2026-08-13):**  
`GET https://business.utah.gov/wp-json/tribe/events/v1/events?per_page=50&categories=grants`

- Auth: none.
- Returns: The Events Calendar JSON (`title`, `start_date`, `end_date`, `website`, HTML `description`, category `grants`).
- That fetch: **2 events**, `total=2`, `total_pages=1`
  - Rural Communities Opportunity Grant — 2026-09-14 → 2026-10-30 — [rcog](https://business.utah.gov/rural/rcog/)
  - Rural Employment Development Incentive — 2026-11-01 → 2026-11-15 — [REDI](https://business.utah.gov/rural/rural-employment-development-incentive/)
- Missing vs the grants HTML page: Rural County Grant (Jul 1–Sep 1, 2026), earlier 2026 REDI quarters, EAG “Coming Fall of 2026”, tourism coop (closed Jun 10, 2026). Calendar is a **partial** window feed.
- Rate limits: none published by GOEO. This is the stock [The Events Calendar REST API](https://docs.theeventscalendar.com/). Treat as a public CMS endpoint, not an SLA.
- Map card: good for *deadline* on programs we already curated. Not a substitute for program/agency/value/eligibility.
- Out-of-Utah: inherits the linked program (RCOG = local governments only; REDI = businesses creating rural Utah jobs).

### 1.4 GOEO programs that *can* be Map cards (curated, not ingested)

All of these are official HTML/PDF. Apply via Salesforce unless noted. **No bulk API.**

| Program | Official page | What a card can say | Deadline (as of pull) | Out-of-Utah / Texas |
|---|---|---|---|---|
| **Rural Employment Development Incentive (REDI)** | [REDI](https://business.utah.gov/rural/rural-employment-development-incentive/) | Up to $6,000 per new rural high-paying job; cap $250,000/year. Must apply **before** creating the job. Not construction/retail/staffing/utilities. | Quarterly 2-week windows (2026: Feb 1–15, May 1–15, Aug 1–15, Nov 1–15) | **Maybe.** Jobs must be in rural Utah (or listed small cities). A Texas firm that is creating those Utah jobs could apply. A Texas-only firm cannot. |
| **Economic Assistance Grant (EAG)** | [EAG FY2026](https://business.utah.gov/grants/eag/) | Up to $200,000; tiers $50k / $100k / $200k. For-profit or nonprofit. Targeted industries preferred. | “Coming Fall of 2026.” Not on the Events API yet. | **No.** Principal place of business must be in Utah; good standing with Utah Corporations. |
| **Rural County Grant** | [RCG](https://business.utah.gov/rural/rural-county-grant/) | Up to $200,000/year to **rural county governments**. | Opens Jul 1, 2026; closes Sep 1, 2026 | **No** (not a company program). |
| **Rural Communities Opportunity Grant** | [RCOG](https://business.utah.gov/rural/rcog/) | Competitive grants to rural counties, cities, towns. | Opens Sep 14, 2026; closes Oct 30, 2026 | **No** (local governments). |
| **Enterprise Zone Tax Credit** | [Enterprise Zone](https://business.utah.gov/rural/enterprise-zone-tax-credits/) | Ongoing rural tax credit. | Ongoing | Only if the activity is in a designated Utah zone. |
| **Utah Rural Jobs** | [Utah Rural Jobs](https://business.utah.gov/rural/utah-rural-jobs/) | Capital via approved Rural Investment Companies. | Via RICs, not GOEO list API | Rural Utah small businesses. |
| **EDTIF / REDTIF** | [Business recruitment](https://business.utah.gov/business-incentives/) | Post-performance refundable tax credit of new state revenue (urban up to 30%; most-rural 50%). Targeted industries in urban counties. Statute [U.C.A. 63N-2-106](https://le.utah.gov/xcode/Title63N/Chapter2/63N-2-S106.html). | Standing; board vote; ~3 months | **Yes if relocating / expanding into Utah.** Explicitly open to out-of-state companies. About two-thirds of historical participants are Utah-based (office claim on that page). |
| **Industrial Assistance Account** | same page | Grant/loan, **invitation only**. | N/A | Invitation. |
| **Tech & Life Science investor tax credits** | same page | Investor credit, not operating-company grant. Deadlines Sep 1 / Dec 1 / Mar 1 / Jun 1. | Quarterly | Investor must qualify under the Act. |
| **HTRZ / FHIZ / RSDZ / MSEVZ** | [Community initiatives](https://business.utah.gov/community-initiatives/) | Tax-increment **zones** for municipalities. | Ongoing (HTRZ/FHIZ expire 2027-12-31) | **No** (public entities). |
| **Hotel Impact Mitigation / Tourism Coop / Affordable Housing Infrastructure** | [grants](https://business.utah.gov/grants/) | Sector-specific. Tourism coop closed Jun 10, 2026; next announced Mar 2027. Housing grant is Salt Lake County public entities. | Mixed | Almost never a startup card. |
| **Closed:** Air & Water Innovation; Manufacturing Modernization | [grants § Previous](https://business.utah.gov/grants/) | Do not show as open. | Closed | — |

EDTIF has an [incented companies](https://business.utah.gov/business-incentives/companies/) dashboard (similar-awardees flavor, HTML). County wage PDF and targeted-industry PDF are downloads, not APIs.

---

## 2. State financing (USBCI)

[Utah Small Business Credit Initiative](https://business.utah.gov/usbci/) is GOEO’s SSBCI (U.S. Treasury / ARPA) deployment. **Standing program, 2023–2030.** Not a dated RFP feed.

Returns (page + Issuu policy PDFs):

- **Loan Participation Program:** blended rate; $10k–$20M; businesses &lt;750 employees; state buys up to 40% of the loan.
- **Capital Access Program:** loss reserve; $25k–$5M; businesses &lt;500 employees; little/no collateral.
- **Technical Assistance Grant:** legal / accounting / financial advisory via named providers (Suazo, WBC Utah, SBC). VSBs (&lt;10 employees) or SEDI-owned.
- **Lender directory** on the same HTML page (banks, credit unions, CDFIs, UMLF, Suazo, etc.).
- Quarterly reports: Issuu stack, not JSON.

Auth: none to read. Apply **through an enrolled lender**, not GOEO.  
Rate limits / TOS: Utah.gov disclaimer + Treasury SSBCI rules. No API.  
Map card: **yes** as a standing Utah financing card (program, agency=GOEO, value=loan ranges, deadline=program through 2030, next step=pick a listed lender).  
Out-of-Utah: **no.** Page is “Utah small businesses,” enrolled Utah-area lenders, Treasury state allocation.

Part 1 already has a USBCI *org* row. The official page adds current product rules and the lender list the static table does not.

---

## 3. Nucleus (was Innovation Center) and Nucleus Fund

### 3.1 Nucleus Grow + UTIF

[Nucleus Grow](https://www.nucleusutah.org/grow) is the rebrand of the Utah Innovation Center. Official SBIR/STTR help for **Utah-headquartered** companies (or foreign LLC registered with Utah Corporations). Consultations free to Utah businesses.

[UTIF](https://www.nucleusutah.org/utif) (Utah Technology Innovation Funding):

- **Microgrant:** $3,000 (rural $5,000) after a first-time Phase I SBIR/STTR submission.
- **Nonrecourse loan:** $50,000 (rural $60,000) after a Phase II submission (Phase I winner bridging to Phase II).
- Due **≥ 4 weeks before** the federal SBIR/STTR deadline. Must name a specific open solicitation.
- Not competitive; awarded until funds deplete. Limit 1 microgrant / 2 loans per company.
- Registrations required: SAM.gov, SBIR.gov, [Utah Corporations](https://corporations.utah.gov/online-business-registration/).
- Apply: same GOEO Salesforce portal. PDFs: [Program announcement](https://www.nucleusutah.org/s/ProgramAnnouncement_UTIF_MC_2026-March.pdf), [application guide](https://www.nucleusutah.org/s/ApplicationGuide_UTIF_MC_2026-March.pdf).
- Site is JS-rendered Squarespace. **No API.**

Map card: **yes**, and it is the cleanest Utah companion to federal SBIR (exactly the brief’s “Utah lane helps you pursue that federal money”).  
Out-of-Utah / Texas: **no.** Grow eligibility is Utah HQ (or Utah foreign registration). UTIF requires Utah Corporations registration. A Texas company that has not registered in Utah does not match.

### 3.2 Nucleus Fund (was Utah Innovation Fund)

[utahinnovationfund.com](https://www.utahinnovationfund.com/) redirects to [nucleusfundutah.com](https://www.nucleusfundutah.com/). State-created early-stage vehicle for tech **discovered, advanced, or developed at Utah higher-ed**. Apply via an embedded Edda form, not an API.

Map card: weak as a dated opportunity; usable as a next-step for university-spinout fixtures.  
Out-of-Utah: only if the IP/company has a Utah university link.

---

## 4. Utah procurement (U3P) and APEX

### 4.1 U3P / Bonfire (current solicitations)

Official vendor front door: [purchasing.utah.gov](https://purchasing.utah.gov/) → [Current solicitations](https://utah.bonfirehub.com) / [portal](https://utah.bonfirehub.com/portal/?tab=openOpportunities).

- Platform: **U3P-Bonfire** (Euna). Jaggaer/SciQuest migration **completed April 30, 2025** ([vendor training](https://purchasing.utah.gov/training/for-vendors-training/)). APEX’s “Find Opportunities” list still links the old SciQuest URL; that link is stale.
- Portal lists **state agencies, cities, counties, school districts, higher-ed, special districts** under one org switcher (Salt Lake City, SLCo, UDOT, USBE, UVU, SLCC, UTA, etc.).
- [Salt Lake City Purchasing](https://www.slc.gov/Finance/purchasing/) and [Salt Lake County Current Bids](https://www.saltlakecounty.gov/contracts/current-bids/) both defer to the same Bonfire portal. There is not a separate city/county bid API.
- Browse is public HTML/JS (DataTables). Guessed JSON paths (`/PublicPortal/ProjectList`, `/portal/publicProjects`, `/PublicPortal/OpportunityList`) **404**. No Division of Purchasing API guide. Bonfire vendor docs are about *responding*, not a public list API.
- Auth: none to view open opportunities; **registration required to bid** ([vendor registration PDF](https://purchasing.utah.gov/wp-content/uploads/Vendor-Registration-PDF.pdf)).
- TOS: Utah.gov disclaimer + Euna/Bonfire vendor terms (login). No published rate limit because there is no public API.
- **Fact:** a live bid feed would be **scrape-only** (or a one-off vendor export if Purchasing ever grants one). Brief says do not scrape every .gov. Do not treat scrape as the weekend plan.
- Map card: **yes** for individual solicitations *if* a human or a permitted feed supplies title, agency, due date, link. Without that, the honest card is “Utah / local procurement exists; register on U3P; APEX will bid-match.”
- Out-of-Utah: **usually yes.** Public procurement is open to any qualified vendor unless a given solicitation restricts it. Registration does not pre-qualify ([SLC](https://www.slc.gov/Finance/purchasing/)).

### 4.2 Statewide cooperative contracts (already awarded)

[statecontracts.utah.gov/Home/Search](https://statecontracts.utah.gov/Home/Search) is the Best Value Cooperative Contract directory. HTML search. A guessed `/Home/SearchContracts` path returned a technical-error page. UI is scheduled to change **August 19, 2026**.

These are **awarded** contracts other Utah public entities can buy from, not open RFPs. Useful as “how the state already buys X,” not as a current-opportunity ingest.

### 4.3 APEX Accelerator

[business.utah.gov/apex](https://business.utah.gov/apex/) — GOEO / DoD-funded counseling. County-by-county signup on `utahapex.ecenterdirect.com`.

- Free 1:1 help: SAM, certifications, RFP review, CMMC.
- **Proprietary bid-match email** for *clients* (NAICS + keywords vs multiple portals). That software is not a public API.
- Points at U3P, SAM.gov, DIBBS, SBIR, USAspending (federal stack we already planned).
- Also points at [LYNX Alliance](https://www.lynxconnect.io/) (DoW OSBP platform). Third-party, account required, not a Utah bulk source.

Map card: **yes** as the Utah procurement *next step*, especially fixtures 2 and 4 (aero, cyber).  
Out-of-Utah: signup is by **Utah county**. A Texas company is not an APEX Utah client.

---

## 5. Open data, transparency, GIS

| Portal | Status (2026-08-13) | Use for State lane |
|---|---|---|
| [opendata.utah.gov](https://opendata.utah.gov/) | **“This domain has been decommissioned.”** Catalog API still answers but returned **Dallas PD** rows. Unusable. | None |
| [utah.gov/about/data.html](https://www.utah.gov/about/data.html) | Still links the dead Socrata catalog | Stale index |
| [opendata.gis.utah.gov](https://opendata.gis.utah.gov/) / [gis.utah.gov SGID](https://gis.utah.gov/products/sgid/) | Live ArcGIS Hub + Open SGID. Boundaries, parcels, addresses, [Opportunity Zones via WFRC](https://data.wfrc.utah.gov/datasets/utah-qualified-opportunity-zones/explore). | Geo context only. Not programs, values, or deadlines. |
| [transparent.utah.gov](https://transparent.utah.gov) / [spending.utah.gov](https://spending.utah.gov/) | State expenditure transparency from FY2009 | History of *state* spend, not open opportunities. Different grain than USAspending. |
| [statecontracts](https://statecontracts.utah.gov/Home/Search) | See §4.2 | Awarded contracts |
| [openrecords.utah.gov](https://openrecords.utah.gov) | GRAMA requests | Not a dataset |

Utah.gov terms ([disclaimer](https://www.utah.gov/disclaimer.html)): public service, as-is, personal/informational reuse if unmodified, monitoring allowed, Utah jurisdiction. No API key program and no rate card, because the opportunity API does not exist.

Historical Socrata sets people still cite (EDTIF 2014 totals, taxpayer subsidies 1995–2013) are **stale** even if a ghost endpoint answers. Do not use them for Map cards.

---

## 6. GOPB and other state grant indexes

[GOPB Funding Resources](https://gopb.utah.gov/funding-resources/) describes a “comprehensive listing” of state + select federal opportunities, searchable by eligibility / category / type. The link is a **Google Looker Studio** report (`datastudio.google.com/reporting/ef90555b-7a4d-4b8e-898e-c427c996bf65`). Human dashboard. **Not an API.** `/planningresources` on gopb.utah.gov 404s.

Also on that page: [WaterFunding.utah.gov](https://gopb.utah.gov/waterfunding) (water projects), plus PDFs (GOPB Grant Playbook, GOEO apply guide). USU’s [funding databases](https://research.usu.edu/rd/funding/funding-opportunity-databases.php) page repeats the GOPB portal and then sends researchers to **GrantForward (USU SSO)**, Foundation Directory, and the federal sites. GrantForward is not a public Utah API.

Partner-agency HTML indexes (same pattern: pages + windows, no API):

- [UDAF Grants and Loans](https://ag.utah.gov/grants-and-loans/) — several **open 2026** windows (Food Security through Aug 31; UGIP through Dec 31; McAllister easements through Aug 31; salinity Jul 1–Sep 1). Aimed at producers / land / food systems. Texas ag firm: generally **no**.
- [Outdoor Recreation grants](https://recreation.utah.gov/grants/) — UORG / RRI / CPR / RTP mostly **2026 cycle closed**. Youth Engagement Aug 3–Sep 21, 2026. Applicants are usually communities, nonprofits, agencies, not SaaS startups. Apply via `utdnror.my.site.com` (Salesforce). **No API.**
- [Utah Broadband Center grants](https://connecting.utah.gov/grants) — BIG BEAD Benefit-of-the-Bargain round **closed Jul 10, 2025**. Not a current startup card. Maps (UGRC broadband, BEAD awards, [locate.utah.gov](https://locate.utah.gov/)) are GIS.
- [Office of Energy Development tax credits](https://energy.utah.gov/homepage/tax-credits/) — incentive pages, not a list API.
- [Multicultural Affairs grants](https://multicultural.utah.gov/grants/) — linked from GOEO; community grants, HTML.

---

## 7. Universities (tech transfer / SBIR help)

None of the flagship TTOs publish a public **grant opportunity** API. They publish licensing catalogs and point at federal SBIR + Nucleus / Nucleus Fund.

| School | Official page | What you get | API? | Out-of-Utah |
|---|---|---|---|---|
| **University of Utah TLO** (PIVOT / TCO successor) | [technologylicensing.utah.edu](https://technologylicensing.utah.edu/) | [Available technologies](https://technologylicensing.utah.edu/technologies) HTML catalog; [startup funding](https://technologylicensing.utah.edu/for-startups/startup-funding) points at SBIR, Launchpad Seed Fund, Nucleus Fund, U Ventures/EPIC. Faculty inventor portal is login-only. | No grant API. Tech list is a website. | Licensing: **yes** (industry anywhere). Launchpad / faculty programs: campus. |
| **USU Technology Transfer** | [research.usu.edu tech transfer](https://research.usu.edu/techtransfer/) | Disclose / license. [Licensing opportunities](https://research.usu.edu/rii/tech-transfer/licensing-opportunities/index.php) HTML + Flintbox search. SBIR page is advice, not a feed. | No | Licensing: yes |
| **BYU Tech Transfer** | [techtransfer.byu.edu](https://techtransfer.byu.edu/) | Office + technologies marketing. | No | Licensing: yes |
| **UVU / Utah Tech / SUU / SLCC** | entrepreneurship centers already in Part 1 | Institutes, not opportunity APIs | No | Local programs |

University rows in Part 1 (Lassonde, Rollins, USU eCenter, UVU, SUU, Atwood) are **centers**. They do not add current SBIR topics. Current SBIR topics still come from [SBIR.gov](https://www.sbir.gov/data) (federal).

---

## 8. Local government

SLC and Salt Lake County **do not** run a separate bid API. Both send vendors to U3P Bonfire (§4.1). Other cities/counties on the Bonfire org list work the same way.

Local *economic development* sites in Part 1 (chambers, AOGs, city ED pages) are contact directories. Revolving loan funds (Mountainland, SEUALG, R6) are HTML program pages, Utah-geography only.

---

## Opportunity Map: what we can actually fill

| Card field | Utah source that can fill it | How |
|---|---|---|
| program | GOEO / Nucleus / USBCI / UDAF pages; U3P title | Curate or (procurement) portal |
| agency | Same pages | Curate |
| value | REDI $6k/job; EAG ≤$200k; UTIF $3–5k / $50–60k; USBCI loan bands; EDTIF % of new state revenue | Curate from official page |
| deadline | Events API (partial) + program pages | Curate + optional calendar poll |
| why / concerns | Our matcher, not a Utah API | — |
| similar awardees | EDTIF companies dashboard (HTML); USBCI news posts; federal USAspending/SBIR for the *federal* twin | Thin on the Utah side |
| next step | Salesforce apply, listed USBCI lender, APEX signup, U3P register, Nucleus workshop | Curate |

Part 1’s 213 rows fill **none** of value/deadline/next-step unless we hand-enrich them.

---

## Out-of-Utah matching (decision already on the map)

Spec already says an out-of-Utah company can still fit some Utah programs ([decision log](../decision-log.md), 2026-08-13). This research assigns that per source:

**Can match without being a Utah company today**

- Most **U3P** solicitations (qualified vendor).
- **EDTIF/REDTIF** if the project is a Utah expansion or relocation.
- University **licensing** (buy/license IP).
- Anything on Utah pages that is actually **federal** (Grants.gov, SBIR.gov, SBA). Those belong on the Federal badge.

**Match only if they create Utah presence**

- **REDI** (new rural Utah jobs; apply first).
- **Enterprise Zone** (activity in the zone).
- **Nucleus Grow / UTIF** after Utah HQ or Utah foreign-entity registration.
- **Nucleus Fund** with Utah university technology.

**Do not match a Texas-only company**

- **USBCI** loans.
- **EAG** (Utah principal place of business).
- **Rural County / RCOG / HTRZ / housing / tourism coop** (governments and destinations).
- **APEX** as a Utah client (county signup).
- Most **UDAF** producer programs.

---

## What not to do

- Do not treat `opendata.utah.gov` or leftover Socrata URLs as a source.
- Do not treat the Part 1 / Startup State CSV as current opportunities.
- Do not plan to scrape U3P, Nucleus, or Salesforce. Flagged here as scrape-only **fact**, not a recommendation.
- Do not use Jaggaer/SciQuest (`bids.sciquest.com`) as current.
- Do not ingest GrantForward, Looker Studio, or Issuu as APIs.
- Do not build a second Utah-only site. Same map, Utah badge, curated subset ([reuse brief](../briefs/startup-state-reuse.md)).

---

## Weekend-sized State lane (given this inventory)

Federal 2–4 APIs remain the core.

Utah lane that can ship without an ingest fantasy:

1. **Curate ~10 standing cards** from official pages: Nucleus Grow + UTIF, USBCI (LPP/CAP), APEX, U3P registration, EDTIF/REDTIF, REDI, EAG (when it opens), Enterprise Zone, maybe one UDAF or Outdoor Rec only if a fixture is actually ag/rec.
2. **Optional poll** of the Events Calendar REST endpoint to refresh GOEO windows we already know.
3. **Optional refresh** of the Startup State CSV if the directory must stay live. Still not opportunity rows.
4. Case 5 (parent/youth marketplace): USBCI + APEX + “no strong federal grant” is an honest Utah answer. EAG/REDI/UTIF will usually be **probably not**.

That is the optional Utah advantage the brief asked for: economic development and innovation programs, state financing, university SBIR help, local procurement *access*, Utah procurement *portal*. It is not a fourth federal-style API.

---

## Sources fetched

- https://startup.utah.gov/ , /resources/ , /fund-small-business/ , /growth-funding/ , /government-contracts-2/  
- https://startup.utah.gov/wp-json/ , WP All Export CSV (213 rows)  
- https://business.utah.gov/ , /grants/ , /grants/eag/ , /usbci/ , /apex/ , /business-incentives/ , /rural/rural-employment-development-incentive/ , /rural/rural-county-grant/  
- https://business.utah.gov/wp-json/tribe/events/v1/events?categories=grants  
- https://goed.my.salesforce-sites.com/econ/PtlCase  
- https://www.nucleusutah.org/ , /grow , /utif  
- https://www.utahinnovationfund.com/ → https://www.nucleusfundutah.com/  
- https://purchasing.utah.gov/ , /training/for-vendors-training/  
- https://utah.bonfirehub.com/portal/?tab=openOpportunities  
- https://statecontracts.utah.gov/Home/Search  
- https://www.slc.gov/Finance/purchasing/  
- https://www.saltlakecounty.gov/contracts/current-bids/  
- https://opendata.utah.gov/ (decommissioned)  
- https://www.utah.gov/government/open.html , /about/data.html , /disclaimer.html  
- https://gis.utah.gov/products/sgid/ , https://opendata.gis.utah.gov/  
- https://gopb.utah.gov/funding-resources/  
- https://ag.utah.gov/grants-and-loans/  
- https://recreation.utah.gov/grants/  
- https://connecting.utah.gov/ , /grants  
- https://technologylicensing.utah.edu/ , /technologies , /for-startups/startup-funding  
- https://research.usu.edu/techtransfer/ , licensing opportunities, funding-opportunity-databases  
- https://techtransfer.byu.edu/  
- Part 1 `resources.json` (213 rows) compared to the live Startup State CSV  
