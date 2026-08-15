# GOED / Startup State — Government Opportunity Finder

Source: [startupstate-hackathon-brief.lovable.app](https://startupstate-hackathon-brief.lovable.app/?utm_source=luma)
Pulled 2026-08-12. Prize $5,000 (confirmed separately). This is the GOED Opportunity Finder brief.

## The ask

Turn the federal government from a maze into a resource. A founder should be able to say what their company is and get: what government resources might help, and why.

Not another grant search box. The differentiator is translating startup language into government language.

Worked example: 15-person Utah AI healthcare company, $2.5M raised, $1M ARR, wants $500K–$2M non-dilutive for product and hospital pilots → NSF Seed Fund, NIH/HHS, SBIR/STTR, possible federal procurement, each with a why.

## Required product (5 parts)

1. **Understand a startup** — natural language and/or a simple profile. Extract industry, tech, location, employees, revenue, stage, capital, R&D, product maturity, customers, capital need, use of funds.
2. **Discover opportunities** — federal sources. Recommended stack below.
3. **Match** — rank by relevance, not keyword. Map "software that reduces admin burden on nurses" to healthcare, AI, workforce, health IT, etc.
4. **Explain** — why you should care, what could make you ineligible, what to verify, what to do next. Never present an AI assessment as a definitive eligibility determination. Fit labels: likely / potential-verify / adjacent / probably not.
5. **History** — who else received this money (USAspending, SBIR.gov): similar companies, amounts, geography, sector.

## Data stack (common foundation)

Use 2–4 of these. Do not ingest the entire federal government.

- [Grants.gov search2](https://www.grants.gov/api/api-guide) — current/forecasted grants, no auth for search
- [SAM.gov Assistance Listings API](https://open.gsa.gov/api/assistance-listings/) — grants, loans, scholarships, program descriptions (new 2026)
- [USAspending V2](https://api.usaspending.gov/) — historical awards, recipients, NAICS, geography, no auth
- [SBIR.gov](https://www.sbir.gov/data) — solicitations, topics, awards, companies

Optional Utah layer (state/university/local/procurement) is an advantage. Federal discovery is the required core.

Teams may API, download, pre-process, cache, or use samples. Combine structured data with LLM search.

## Core experience

Tell us about your company → ask only the missing questions → Government Opportunity Map (counts, potential funding, agencies, deadlines). Each card: program, agency, value range, deadline, why fit, concerns, similar funded companies, next steps.

Bonus only after the core works: alerts, similar companies, 12-month funding strategy, agency map, opportunity graph, application checklist.

## Five required test cases (all Utah)

1. AI healthcare SaaS, 15 people, $1M ARR, $2.5M raised, $500K–$2M for product + hospital pilots. Expect healthcare, AI/R&D, SBIR, workforce, HHS/NIH/NSF, historical recipients.
2. Aerospace manufacturing, 35 people, $3M rev, $8M raised, $2M–$5M for scale-up + R&D. Expect manufacturing, aero/defense, DoD/NASA/DOE, R&D, procurement, similar awardees.
3. Water/climate sensors + AI, 10 people, $500K rev, $1.5M raised, $500K–$3M for product + municipal pilots. Expect water/env, DOE/EPA, climate, infrastructure, research, government pilots.
4. Cyber threat detection, 22 people, $2M ARR, $5M raised, $1M–$3M for R&D + federal/commercial. Expect cyber, DoD/DHS, SBIR, procurement, historical cyber recipients.
5. **Hard on purpose:** parent/youth-activities marketplace, 8 people, $750K rev, $1M raised, $250K–$1M to expand. Expect workforce/education/youth/SBA/community — **and reward systems that say traditional federal grants are probably a poor fit instead of hallucinating one.**

## Out of scope

Every agency. Guaranteed eligibility. Full application system. Every state program. Production platform. Scraping every .gov. A perfect recommendation engine.

They want a working POC that shows government data made intelligent and startup-friendly.

## Judging

- 30% Usefulness — would a real founder use this, time saved, opportunities they would miss
- 25% Quality of matching — relevance, depth, context, strong vs weak, explanations
- 20% Intelligence and insight — beyond search: similar companies, history, adjacent, eligibility concerns, procurement, why
- 15% UX — simple, fast, little jargon
- 10% Technical execution — works, data integration, thoughtful AI

Winning product: "I told you about my company. Now tell me what government resources I should know about, and show me why." Not the most data or the fanciest model.
