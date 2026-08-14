# Decision Log

What was decided, when, and why. **Decisions only** - not specs, not current state, not
implementation details. One line per decision; reference issue IDs instead of embedding detail.
If an entry needs more than 2 lines, it belongs in a dedicated doc, not here.

Format: `- **YYYY-MM-DD** - Decision description. See <issue-ref>.`

---

- **2026-08-13** - Created this private repo from craigcossairt/trellis after the GOED Part 2 brief was posted. Git history starts here on purpose.
- **2026-08-13** - Primary bounty is GOED Government Opportunity Finder ($5k). New app, Startup State skin, Federal + Utah lanes. Not a fork of craigcossairt/startup-state. See `docs/primary-bounty.md`.
- **2026-08-13** - Wayfinder destination is a locked spec (not the weekend build). Product shape reopened, then locked as: new app, one Opportunity Map, infer-then-ask Intake, State lane in the spec. See grilling in session.
- **2026-08-13** - Lanes are Federal / State (Utah is the first Jurisdiction). Same ranked list, source badge, Utah rises when federal is weak. See grilling in session.
- **2026-08-13** - Spec plans bonuses into the architecture with a cut-line, rather than bolting them on later. Retrieve-then-LLM rank. Lift any Part 1 piece that does not conflict with the Part 2 brief. See grilling in session.
- **2026-08-13** - Source badges are Federal or Utah. No footer expansion note. Location is a match input: an out-of-Utah company can still fit some Utah programs. See grilling in session.
- **2026-08-13** - Spec includes all four brief federal APIs and the larger GOEO table with categorization/filtering. All brief bonus features are in the spec as planned architecture. See grilling in session.
- **2026-08-13** - Product copy is fit, never eligible. Out-of-Utah companies can still match some Utah programs (adjacent + concern unless nonresident-open). Map default is retrieved-by-category, not the full 213; chips widen. Bonus cut-line last-to-first: graph, agency map, chat, alerts, similar-companies surface, 12-month, checklist, extra federal sources, welcome-back. See grilling in session.
- **2026-08-14** - Installed mattpocock/skills (24 skills, excluding `tdd` collision). Setup docs in `docs/agents/`. See `skills-lock.json`.
- **2026-08-14** - Locked Company profile schema after HITL grilling rounds 1–3. See `docs/spec/company-profile-schema.md` and [Company profile schema](https://github.com/craigcossairt/startup-state-2/issues/8). Supersedes draft-only entry from same day.
- **2026-08-14** - Locked retrieve: Grants.gov + GOEO IDs only; SAM join; USAspending/SBIR CSV history-on-card; GOEO firing matrix; probably-not banner copy. See `docs/spec/retrieve-and-rank.md` and [Retrieve and probably-not floor](https://github.com/craigcossairt/startup-state-2/issues/2). Supersedes draft-only entry from same day.
- **2026-08-14** - Locked shared record: listing-grain Opportunity vs Ranked card; instrument enum; `{source}:{nativeId}`; bonuses are join keys; similar-companies is on-card history. See `docs/spec/shared-opportunity-record.md` and [Shared opportunity record](https://github.com/craigcossairt/startup-state-2/issues/3).
- **2026-08-14** - Locked Intake / map structure: editorial stack, fixture rail on the map, full Ranked cards, case-5 banner. Visual end state deferred to a design handoff. See `docs/spec/intake-and-map-look.md` and [Intake and Opportunity Map look](https://github.com/craigcossairt/startup-state-2/issues/9).
- **2026-08-14** - Locked judged click path: fixture-1 then fixture-5, fixtures first, no bonus clicks. Optional speech, not required. See `docs/spec/judged-demo-walkthrough.md` and [Judged demo walkthrough](https://github.com/craigcossairt/startup-state-2/issues/4).
- **2026-08-14** - Weekend cache: no SAM Role (no entity); key in Bitwarden + `.env`; SBIR CSV complete; SAM Active dump 800/2865; Grants.gov fixture slices on `main`. See [SAM Role and Thursday cache](https://github.com/craigcossairt/startup-state-2/issues/12) and `data/cache/README.md`.
- **2026-08-14** - State lane is GOEO six-key retrieve plus seven curated cards. U3P is a portal card, no scrape. Events Calendar out. See `docs/spec/utah-state-lane-mix.md` and [Utah State-lane mix](https://github.com/craigcossairt/startup-state-2/issues/13).
- **2026-08-13** - GOEO retrieve uses six title/description keys, not source Funding/topics. See [GOEO table categories](https://github.com/craigcossairt/startup-state-2/issues/6).
- **2026-08-13** - Federal card split: Grants.gov open list, SAM CFDA catalog (cache), USAspending history, SBIR award CSV (APIs 403). See [Four federal APIs](https://github.com/craigcossairt/startup-state-2/issues/7).
- **2026-08-13** - No official Utah opportunity API. State lane is not a live ingest. See [Utah state APIs](https://github.com/craigcossairt/startup-state-2/issues/10).
- **2026-08-13** - Infer and rank use Anthropic Haiku 4.5 via Vercel AI SDK on the Part 1 key. Rank may only emit retrieved IDs. See [Infer and rank provider](https://github.com/craigcossairt/startup-state-2/issues/5). Superseded by the 2026-08-13 Grok 4.6 lock on the same ticket.
- **2026-08-13** - Infer and rank use Grok 4.6 (`grok-4.6` via `https://api.x.ai/v1`). Infer at `reasoning_effort: low`. Rank/explain at `medium`, adjustable. Rank may only emit retrieved IDs. Needs `XAI_API_KEY`. See [Infer and rank provider](https://github.com/craigcossairt/startup-state-2/issues/5).
