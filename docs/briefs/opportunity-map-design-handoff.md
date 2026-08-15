# Opportunity Map, Claude Design brief

Craig: paste **Claude Design brief** below into Claude Design as the prompt. This file is the product facts for `/map`. It names jobs, information, and situations. It does not name arrangement, hierarchy, density, or controls-as-widgets. That is the point. A locked structure note already lives in `docs/spec/intake-and-map-look.md`. Leave that file closed while you design.

Done when Claude Design has produced Opportunity Map screens for all four readings in **What to produce**, using the sample listings and the locked sentences in this file.

---

## Claude Design brief

Design the Opportunity Map page for Startup State, a GOEO product that could ship on startup.utah.gov.

A founder has already described a company. This page answers one question: what government resources should I know about, and why.

Invent the visual system from the jobs and information below. Use the sample listings as the words on the page. Do not invent programs, dollar amounts, dates, or company names.

### Job

The Opportunity Map is a ranked set of official listings for one Company profile. Federal and Utah listings sit in the same set. Best Fit first.

It is not a determination that the company can apply. The only ranking language is Fit: likely, potential-verify, adjacent, probably not. Never eligible.

A search box would return keyword hits. This page has to translate. A founder said "software that cuts admin work for nurses." The page shows why that company should care about a 30-word NIH notice, what to verify, and what to do next.

A judge will spend about 90 seconds here. A founder may come back later. The quality bar is an official Utah site, not a hackathon poster.

### How someone gets here

Home is Intake. The founder gives a website, a sentence, or a test case. Infer fills a Company profile. If infer guessed any must-have field, a confirm step asks them to accept or edit. The Opportunity Map runs only after every must-have is known.

A test-case click skips confirm and opens this page with that company already known.

If this page loads with no Company profile, the only useful move is to start at Intake. Copy: `No company profile yet. Start from Intake.`

### Who is looking

A Utah founder who just described the company. They are not a grants officer. They need little jargon and a reason to trust the ranking.

A judge standing over a laptop. They will open Healthcare AI, then Youth marketplace (honest-no). Those two readings are the ones that have to land.

### What the founder is trying to do

1. See which official listings matter for this company, strongest Fit first.
2. Tell Federal from Utah on every listing.
3. Read why this listing fits this company, in startup language.
4. See what could make it a weak fit, and what to verify.
5. See who else received similar money, when history exists.
6. Take a next step on a listing, usually an official url.
7. Know when traditional federal grants look like a poor fit, without hiding those federal listings.
8. Change the retrieve set (lane, Utah topics, leftover directory) and get a new ranking.
9. Narrow the already-ranked set by Fit without running a new search.
10. Switch among the five official test cases without going back to Intake.
11. See and edit the Company profile used for this ranking. Saving it runs retrieve and rank again.
12. Subscribe to this company plus the current retrieve set ("Watch this search"). That is a search subscription, not a watch on one listing.

Secondary destinations exist off this page: Plan, Graph, Alerts, a similar-companies collection, and a helper named Navigator. A founder who wants those can leave this page for them. The ranked set is this page's job.

### Company profile on this page

The ranking is for one company. The founder should be able to see what was used and change it.

Must-haves, always present before this page runs:

- What they do (1 to 3 sentences)
- Technologies (open words)
- Sectors (closed tags: healthcare, ai, saas, aerospace, manufacturing, defense, water, climate, environment, infrastructure, cybersecurity, marketplace, education, youth, workforce)
- Country and US state
- Employees (a number, or a min/max that is the same number)
- Revenue (one dollar amount plus basis: ARR or annual revenue)
- Capital raised (equity plus convertibles, dollars)
- Capital need (a dollar range)
- Use of funds (closed tags: product development, pilots, scale-up, R&D, hiring, equipment, expansion, commercial growth, manufacturing scale)

Sometimes also present, never required to open the page: city, stage, R&D intensity, product maturity, customer types.

Utah HQ is data. Federal listings ignore Utah residency. A Utah program for a company outside Utah is a real Fit only when that program allows it. Otherwise the Fit is adjacent and a concern says so.

### One ranked listing

The product record is a Ranked card. That is the information packet for one official listing plus this company's Fit. It is not a request for a particular widget.

Each Ranked card carries:

| Field | What it is |
| --- | --- |
| Source | Federal, or Utah (this demo's jurisdiction) |
| Fit | likely / potential-verify / adjacent / probably not |
| Instrument | grant, loan, incentive, counseling, contracting help, procurement, or other. Independent of Federal / Utah. |
| Status | posted, forecasted, or standing |
| Program | Official title. Federal titles are often 15 to 30 words of agency language. |
| Opportunity number | Optional federal id such as `RFA-RM-27-013`. Display id, not the retrieve key. |
| Agency | Name, optional code (`HHS-NIH11`) |
| Value | USD min and max, or missing |
| Deadline | ISO date, or missing. Standing Utah programs are usually missing. |
| Why | One or two short sentences. Rank wrote this for this company. |
| Concerns | Zero or more short verify items. Empty is allowed. |
| Next step | A label, optional official url |
| Similar awardees | Zero or more history rows: name, optional amount, year, city, state, summary, url. Empty is allowed. Do not invent firms. |
| Description | Optional official blurb. This is catalog text, not the why. |

Missing value or deadline displays as `Not published`. Do not invent a range or a date.

Display `probably_not` as `probably not`.

The default ranked set is 8 to 12 listings. Retrieve may have collected about 50 official ids. Rank may emit only those ids. The page never shows a program the retrieve step did not return.

Sort is best Fit first. Lane is not a sort key. Federal and Utah interleave.

### Set-level facts

The page can also state facts about the current ranked set:

- How many official ids retrieve found
- How many Ranked cards rank returned
- How many are Federal, how many are Utah
- How many of each Fit
- Sum of published `maxUsd` values, or `Not published` when none have a number
- How many deadlines fall in the next 90 days

These are facts about the set. They are not a score. There is no percent match.

### Controls and what they do

These change what the page is ranking or what of the ranked set is in view. They are capabilities, not a request for a particular control style.

Retrieve controls re-run retrieve, still capped at about 50 ids, then re-rank:

- Lane: Federal only, Utah only, or both (default)
- Utah topics: SBIR help, Contracting, State capital, Workforce, Counseling, Trade. Adding a topic widens the Utah retrieve set.
- `directory`: include leftover GOEO rows (about 180). Still capped. Default map is the first retrieved slice, not all 213.

Fit controls filter the already-ranked set. They do not re-retrieve and they do not spend another model call.

Watch this search stores this Company profile plus the current retrieve set. Coming back later can say how many new retrieved ids appeared. Copy when on: `Watching this search`. Copy when new ids exist: `Watching this search · N new`.

### Test cases

Five official companies stay available on this page so a judge can flip companies without returning to Intake. Labels, locked:

- Healthcare AI
- Aerospace
- Water / climate
- Cyber
- Youth marketplace (honest-no)

The judged path is Healthcare AI, then Youth marketplace (honest-no). The other three must work. They are not the first two clicks.

### Honest-no notice

After rank, if no Federal listing is `likely` or `potential-verify`, and at least one Utah listing is `likely`, `potential-verify`, or a strong `adjacent`, the page must say this, exactly:

> Traditional federal grants look like a poor fit for this company. Utah programs below are the stronger place to start.

Utah listings lead. One to three Federal `probably not` listings stay in the set with real whys and concerns. Do not hide them. Do not invent a strong federal grant.

Youth marketplace (honest-no) is the reading that trips this.

### Situations

**In progress.** Retrieve, then rank, then history attach. Copy the product already uses:

- Searching federal and Utah programs
- Ranking programs by fit
- Attaching similar awards

Listings may appear after retrieve with program, agency, and lane known, before Fit, why, concerns, and history are ready. That in-progress state is `Ranking by fit`.

**Ready.** 8 to 12 Ranked cards, best Fit first. Floor notice only when the rule above trips.

**Fit filter matches nothing.** The retrieve set still exists. The ranked set is hidden by the filter.

**No similar awardees on a listing.** Say none attached. Do not invent firms.

**No Company profile.** Send the founder to Intake. Do not rank an empty company.

**Error.** Rank or retrieve failed. The founder needs the failure and a way to try again or pick a test case.

**Restored session.** This company plus these retrieve controls were ranked earlier in the tab. The last ranked set can return without waiting.

### Language

User-facing copy is Fit, never eligible, never eligibility.

No em dash in user-facing copy.

Do not write "grant search." Do not treat every listing as a grant. Instrument is its own field.

Helper copy that already exists elsewhere in the product, for tone:

- Intake hero: `Tell us about your company.`
- Intake lead: `Share your website, describe the company, or pick a test case. We rank retrieved federal and Utah programs by fit. This is not a determination that you can apply.`
- Footer line: `An official state of Utah website`

### Brand the product already wears

Startup State wordmark plus GOEO. Official Utah, not a venture studio.

Type: Mulish, Source Sans 3, Source Serif 4.

Colors already in the product:

| Name | Hex |
| --- | --- |
| Midnight | `#0a192e` |
| Vibrant Green | `#00a24c` |
| Bright Green | `#13df81` |
| Light Green | `#a3f0ae` |
| Onyx | `#414042` |
| Muted | `#6b6c70` |
| Platinum | `#d3d4d9` |
| Off-white | `#f6f7f8` |
| Rule | `#e4e5e7` |
| White | `#ffffff` |

Wordmarks live under `public/brand/` (horizontal Startup State, mark, mark on white). GOEO lockup sits next to the wordmark in the site chrome.

The site chrome also links Playbook, Resources, Startups, Careers, News, and Swag. Those are other pages. Startups is a geographic map of companies. This page is not that page. Opportunity Map is the current item when someone is here.

### What to produce

Four readings of this page, same product, different information:

1. **Healthcare AI, ready.** Strong federal Fit plus at least one Utah companion. History attached on at least one listing. No floor notice.
2. **Youth marketplace (honest-no), ready.** Floor sentence visible. Utah listings lead. One to three Federal `probably not` listings still present, with why and concerns.
3. **Healthcare AI, in progress.** Retrieve has names. Fit and why are not all in yet.
4. **No company yet.**

Use the sample listings below as the words. Keep program titles at their real length. That length is part of the problem.

### Sample, Healthcare AI

Company, known:

- What they do: AI healthcare SaaS reducing administrative burden on nurses
- Tech: ai, saas, healthcare software
- Sectors: healthcare, ai, saas
- HQ: Salt Lake City, UT, US
- 15 people
- $1,000,000 ARR
- $2,500,000 raised
- Need $500,000 to $2,000,000
- Use of funds: product development, hospital pilots

Set facts for this reading: 47 retrieved, 10 ranked, 7 Federal / 3 Utah, 2 likely, 3 potential-verify, 3 adjacent, 2 probably not, published funding $2,150,000, 4 deadlines in 90 days.

Listing A, Federal, likely, grant, posted

- Program: NIH, CDC and FDA Small Business Innovation Research Grant (Parent SBIR [R43/R44] Clinical Trial Optional)
- Number: `PA-27-100`
- Agency: National Institutes of Health (`HHS-NIH11`)
- Value: Not published
- Deadline: 2027-04-05
- Why: Parent SBIR is the open door for a 15-person Utah AI health company that wants non-dilutive money for product and hospital pilots.
- Concerns: Confirm the work is R&D, not only implementation. Clinical-trial rules may apply if a study sits inside a hospital pilot.
- Next step: Read the notice on Grants.gov (official url)
- Similar awardees: INHERENT BIOSCIENCES, INC., $255,959, 2020, Salt Lake City, UT, "SBIR Phase I: Using patient specific DNA methylation to predict COVID-19 clinical prognosis"

Listing B, Federal, potential-verify, grant, posted

- Program: Model-to-Clinic (M2C) for Precision Medicine with AI: Integrating Imaging with Multimodal Data (PRIMED-AI) (UG3/UH3, Clinical Trial Optional)
- Number: `RFA-RM-27-013`
- Agency: National Institutes of Health
- Value: Not published
- Deadline: 2026-10-19
- Why: The notice is AI plus clinical data, which overlaps this company's sector. The imaging-and-multimodal frame is narrower than nurse admin burden, so this needs a human read.
- Concerns: Applicant type may assume academic or clinical partners. Verify whether a SaaS vendor can apply without a hospital PI.
- Next step: Read RFA-RM-27-013
- Similar awardees: none attached

Listing C, Utah, likely, counseling, standing

- Program: Nucleus Grow
- Agency: Nucleus
- Value: Not published
- Deadline: Not published
- Why: Nucleus is GOEO's SBIR/STTR help desk. This company is Utah HQ with core R&D and a real SBIR-shaped federal listing on the same map.
- Concerns: Confirm Utah HQ or Utah registration before booking.
- Next step: Open Nucleus Grow (https://www.nucleusutah.org/grow)
- Similar awardees: none attached

Listing D, Utah, potential-verify, grant, standing

- Program: Utah Technology Innovation Funding
- Agency: Nucleus / GOEO
- Value: microgrant $3,000 (rural $5,000); loan $50,000 (rural $60,000)
- Deadline: Not published. Apply at least 4 weeks before the named SBIR deadline.
- Why: UTIF exists to help Utah companies pursue SBIR. It is a companion to the federal SBIR listing, not a substitute for it.
- Concerns: Needs Utah Corporations registration. Standing window, not a single close date.
- Next step: Open UTIF (https://www.nucleusutah.org/utif)
- Similar awardees: none attached

### Sample, Youth marketplace (honest-no)

Company, known:

- What they do: Marketplace connecting parents with youth activities and programs
- Tech: marketplace, mobile
- Sectors: marketplace, education, youth
- HQ: Salt Lake City, UT, US
- 8 people
- $750,000 annual revenue
- $1,000,000 raised
- Need $250,000 to $1,000,000
- Use of funds: geographic and category expansion

Set facts for this reading: 31 retrieved, 9 ranked, 2 Federal / 7 Utah, 0 likely federal, 0 potential-verify federal, 3 likely Utah, 2 adjacent, 2 probably not federal, published funding Not published, 0 deadlines in 90 days.

Floor sentence on.

Listing E, Utah, likely, counseling, standing

- Program: Utah SBDC advising
- Agency: Utah SBDC
- Value: Not published
- Deadline: Not published
- Why: An 8-person early-revenue marketplace expanding in Utah is a counseling fit. SBDC is the honest first stop when federal R&D grants are a poor match.
- Concerns: Best if they will use a Utah center.
- Next step: Start Utah SBDC intake
- Similar awardees: none attached

Listing F, Utah, likely, loan, standing

- Program: USBCI lending (LPP / CAP)
- Agency: GOEO / USBCI
- Value: bands from the official USBCI page
- Deadline: Not published
- Why: They have a named capital need and a Utah small business. A state loan is a stronger instrument than a federal R&D grant for expansion.
- Concerns: Utah small businesses only. This is lending, not a grant.
- Next step: Read the listed-lender path (https://business.utah.gov/usbci/)
- Similar awardees: none attached

Listing G, Federal, probably not, grant, posted

- Program: NIH, CDC and FDA Small Business Innovation Research Grant (Parent SBIR [R43/R44] Clinical Trial Optional)
- Agency: National Institutes of Health
- Value: Not published
- Deadline: 2027-04-05
- Why: Parent SBIR funds R&D. A parent-and-youth activities marketplace is not an R&D applicant for this notice.
- Concerns: Do not treat keyword overlap on "youth" as a reason to apply.
- Next step: Read the notice only if the product work is actually R&D
- Similar awardees: none attached

Listing H, Federal, probably not, grant, posted

- Program: CDC National Centers of Excellence in Youth Violence Prevention (YVPCs): Rigorous Evaluation of Prevention Approaches to Prevent and Reduce Youth Violence
- Agency: Centers for Disease Control and Prevention
- Value: Not published
- Deadline: Not published
- Why: The notice is youth-adjacent in topic and a poor fit in applicant and work. This company is a marketplace, not a prevention evaluation center.
- Concerns: Topic words are not Fit.
- Next step: Skip unless partnered with a research center
- Similar awardees: none attached

### Out of this page

Do not design Intake, confirm, Plan, Graph, Alerts, Playbook, or the Startups geography page in this pass. Those exist. This pass is the Opportunity Map.

Do not add greyed coming-soon items.

Do not add a numeric score or an eligible badge.
