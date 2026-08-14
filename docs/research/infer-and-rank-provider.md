# Infer and rank provider

**Ticket:** [Infer and rank provider](https://github.com/craigcossairt/startup-state-2/issues/5)  
**Map:** [Lock the Government Opportunity Finder spec](https://github.com/craigcossairt/startup-state-2/issues/1)  
**Pulled:** 2026-08-13 (machine-local, America/Denver)  
**Scope:** official Anthropic, Vercel AI SDK, Vercel AI Gateway, and xAI docs, plus the Part 1 infer route and the four-federal-apis findings. No invented provider. No app code.

Certainty: model IDs, list prices, structured-output support, Gateway billing rules, and prompt-cache minimums are **pointed at the owning page**. Part 1 infer wiring is **pointed at the route**. Token dollars for five fixtures are **priced from those tables with stated token assumptions**, not a live timed run. Event credit *amounts* are **unpublished** on the event site and the GOED brief.

---

## Answer

Use **Anthropic Claude Haiku 4.5** for both jobs, billed on the **Anthropic API key Craig already has**, called from Next.js route handlers through the **Vercel AI SDK**.

| Job | Provider | Model ID | Why |
|---|---|---|---|
| Infer Company profile | Anthropic | `claude-haiku-4-5-20251001` (alias `claude-haiku-4-5`) | Same model Part 1 already shipped. Fastest Claude. Structured JSON is a first-class API. Temperature 0 + enum sanitize. |
| Rank / why / concerns / next step | Anthropic | same Haiku 4.5 | Retrieve already picked the set. The model only orders that set and writes Fit copy. Do not pay Sonnet/Opus/Fable prices to invent a program we already forbade. |

**SDK, not a second provider.** `ai` + `@ai-sdk/anthropic` with `generateText` + `Output.object({ schema })`. Part 1 already depends on both (`ai` ^6, `@ai-sdk/anthropic` ^3, plus `@anthropic-ai/sdk` for infer). Unify on the AI SDK so infer and rank share Zod schemas. Keep `ANTHROPIC_API_KEY`. Do not require `AI_GATEWAY_API_KEY` or `XAI_API_KEY` to boot the demo.

**Do not default to Vercel AI Gateway as the bill.** Gateway is a router, not a model. Its free tier is a *subset* of models. BYOK needs purchased Gateway credits. Anthropic-direct already works on the key Part 1 used.

**Do not default to xAI.** xAI is a real API with structured outputs. Part 1 has no `XAI_API_KEY`. [aibuilderday.com](https://www.aibuilderday.com/) and the GOED brief do not publish xAI (or any) API credit amounts. Do not invent that path.

**Cache programs. Do not treat model output as the catalog.** SAM dump, SBIR CSV, Grants.gov fixture slices, and USAspending slices are the grounding store ([Four federal APIs](https://github.com/craigcossairt/startup-state-2/issues/7)). Rank JSON may be memoized only as `(profileHash, retrievedIdSetHash)` and must be dropped the moment that ID set changes.

**Escalate once, if Haiku explanations fail a judged walkthrough:** Claude **Sonnet 5** (`claude-sonnet-5`, $2 / $10 per MTok). Not Sonnet 4.6 (legacy, $3 / $15). Not Opus / Fable. Not a new vendor.

---

## What is already locked

- Retrieve first, then the LLM ranks the retrieved set. Never invent a program.
- Product copy is Fit (`likely` / `potential-verify` / `adjacent` / `probably not`), never eligible.
- Federal card split ([Four federal APIs](https://github.com/craigcossairt/startup-state-2/issues/7)): Grants.gov search2 is the open list (no auth); SAM is a keyed CFDA catalog that must be cached; USAspending V2 is history; SBIR APIs are 403, use the award CSV.
- Part 1 infer: Claude Haiku 4.5 via Anthropic SDK, temperature 0, enum-sanitized JSON.
- Company profile fields themselves are a separate grilling ticket ([Company profile schema](https://github.com/craigcossairt/startup-state-2/issues/8)). This note only picks who infers them.

---

## Keys and credits that actually exist

| Asset | Status | Source |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Have.** Part 1 infer, chat, roadmap, and batch scripts all read it. | `C:\Users\Craig Cossairt\startup-state\.env.example` lines 6–7; `src\app\api\playbook\infer-persona\route.ts` |
| Vercel project / Hobby deploy | **Have.** Part 1 is live on Vercel. | Part 1 `CONTEXT.md` |
| Vercel AI Gateway credits | **Unproven amount.** Official pricing: every team has a free tier (subset of models) plus a monthly free credit that starts on first Gateway request. Buying credits leaves the free tier. BYOK is paid-tier only. | [AI Gateway pricing](https://vercel.com/docs/ai-gateway/pricing) |
| xAI / `XAI_API_KEY` | **Not in Part 1.** Not listed in `.env.example`. | Part 1 env |
| Event API credits | **Unpublished.** [aibuilderday.com](https://www.aibuilderday.com/) lists $35K+ prizes, not per-builder API credits. The GOED brief lists data sources, not model credits. `docs/about-me.md` says the budget is "free tiers and event credits" as a constraint, not a measured balance. | Event site + brief + about-me |

Do not plan the weekend on a credit pack that is not on a first-party page. If Friday hands out Anthropic, Gateway, or xAI credits, spend them on the same Haiku path (or on Gateway *after* confirming Haiku is in that pool). Do not switch providers mid-demo.

---

## Part 1 infer (what we are lifting)

`C:\Users\Craig Cossairt\startup-state\src\app\api\playbook\infer-persona\route.ts`

- Runtime: Node, `maxDuration = 20`.
- Client: `@anthropic-ai/sdk`, `process.env.ANTHROPIC_API_KEY`.
- Call: `messages.create({ model: "claude-haiku-4-5-20251001", max_tokens: 400, temperature: 0, system, messages: [{ role: "user", content: text }] })`.
- Output: JSON object of enum fields or `null`. Regex-extract `{…}`, `JSON.parse`, then `sanitize()` against `STAGES` / `SECTORS` / `REGIONS` / `COMMUNITIES` / `GOALS` / `REVENUES`. Unknown values become `null`. `missing[]` lists empty required fields.
- Body cap: 2–500 characters.

That pattern is the infer contract: **null when unsure, never guess, never return an unsanitized enum.** Part 2 infer uses a new Company profile schema (not the six-field Persona), same contract.

Part 1 also ran Haiku for playbook roadmap and catalog retag, and Sonnet 4.6 for Navigator chat via `@ai-sdk/anthropic`. Chat is not this product. Sonnet 4.6 is now a **legacy** Claude ([models overview](https://platform.claude.com/docs/en/about-claude/models/overview)).

Part 1 `CLAUDE.md` still says "Haiku rate limit is 50 RPM." That is **stale against today's official table**. Current Start-tier Haiku 4.5 is 1,000 RPM / 2M ITPM / 400k OTPM ([rate limits](https://platform.claude.com/docs/en/api/rate-limits)). Five fixtures will not hit it. Evaluation-tier new orgs can sit below Start; if a 429 appears, back off. Do not write 50 RPM into Part 2 as a fact.

---

## Official model menu (do not invent one)

### Anthropic ([models](https://platform.claude.com/docs/en/about-claude/models/overview), [pricing](https://platform.claude.com/docs/en/about-claude/pricing))

Current:

| Model | API ID | Input / output per MTok | Latency label | Context |
|---|---|---|---|---|
| Haiku 4.5 | `claude-haiku-4-5-20251001` (alias `claude-haiku-4-5`) | $1 / $5 | Fastest | 200k |
| Sonnet 5 | `claude-sonnet-5` | $2 / $10 | Fast | 1M |
| Opus 5 | `claude-opus-5` | $5 / $25 | Moderate | 1M |
| Fable 5 | `claude-fable-5` | $10 / $50 | Slower | 1M |

Legacy still listed: Sonnet 4.6 at $3 / $15. That is what Part 1 chat used. Do not pick it for new work.

Structured outputs (`output_config.format` JSON schema) are supported on Haiku 4.5, Sonnet 5, Sonnet 4.6, Opus 5, and the rest of the current list ([structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)). Infer and rank both want that, not regex JSON.

Prompt cache (Haiku 4.5): 5-minute write $1.25 / MTok, 1-hour write $2, hit $0.10. **Minimum cacheable prefix on Haiku 4.5 is 4,096 tokens** ([prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)). Infer will never hit that. Rank only hits it if the retrieved-set prefix is large and *byte-identical* across calls.

New Anthropic accounts get a small amount of free API credit ([pricing FAQ](https://platform.claude.com/docs/en/about-claude/pricing)). Amount is not published as a number. Craig's Part 1 key already has usage history.

### Vercel AI SDK ([structured data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data))

- `generateText({ model, output: Output.object({ schema }) })` for one-shot infer and rank.
- `streamText` + `partialOutputStream` if rank cards should paint in.
- Schema validates; `NoObjectGeneratedError` on parse/schema miss.
- On Vercel, `model: anthropic("claude-haiku-4-5")` with `ANTHROPIC_API_KEY` is the direct path. `model: "anthropic/claude-haiku-4.5"` is the Gateway string ([Haiku on Gateway](https://vercel.com/ai-gateway/models/claude-haiku-4.5)). Use the first unless we deliberately switch billing.

### Vercel AI Gateway ([docs](https://vercel.com/docs/ai-gateway), [pricing](https://vercel.com/docs/ai-gateway/pricing))

- One key, many models, **no markup**, list price.
- Free tier: subset of models, tighter 429s, monthly free credit from first request. Buying credits ends the free monthly credit.
- BYOK: paid tier only. Failed BYOK retries on Vercel keys and burns Gateway credits.
- Useful later for observability or a Friday credit pack. Extra moving part for a 24-hour demo if the Anthropic key already works.

Unproven here: whether `anthropic/claude-haiku-4.5` is in the current free-tier subset. The pricing page says to filter [Free Tier models](https://vercel.com/ai-gateway/models?freeTier=true). Community reports exist of Anthropic models returning `RestrictedModelsError` on free. Do not bet the judged path on that filter without checking Craig's dashboard.

### xAI ([pricing](https://docs.x.ai/developers/pricing), [structured outputs](https://docs.x.ai/developers/model-capabilities/text/structured-outputs))

| Model | Input / cached / output per MTok (&lt;200k prompt) |
|---|---|
| `grok-4.3` | $1.25 / $0.20 / $2.50 |
| `grok-4.6` | $2.00 / $0.50 / $6.00 |
| `grok-build-0.1` | $1.00 / $0.20 / $2.00 |

Structured JSON via `response_format` / `parse()` is real. AI SDK examples use `xai/grok-4.6`. Grok 4.3 is cheaper on output than Haiku. That does not create a key we do not have. Skip unless a first-party xAI key appears.

---

## Recommendation, with the one fact it is safe because of

The work is safe on Haiku because **retrieve, not the model, is the catalog.** Rank cannot invent a Grants.gov `id`, a SAM `assistanceListingId`, an SBIR award row, or a GOEO `external_id` if the server (1) only sends those IDs in and (2) drops any ID the model emits that was not in that set. A bigger model does not make that rule truer. It only makes why-copy nicer, at 2–10× the token price and a slower first card.

That is also why we stay on Anthropic: the key exists, the model ID is already in production code, structured outputs are documented on Haiku 4.5, and the stack is Next.js on Vercel. Gateway and xAI are real products. They are not keys we can point at today.

### Infer

1. Route: `POST /api/infer` (name later). Node runtime, ~20s budget like Part 1.
2. `generateText` + `Output.object` against the Company profile Zod schema once [Company profile schema](https://github.com/craigcossairt/startup-state-2/issues/8) locks types.
3. `temperature: 0`. Null when the sentence has no signal. Do not default stage or use-of-funds.
4. Server sanitize every enum / range. `missing[]` drives Intake questions. Infer-if-present fields never block the map.
5. Fixtures can skip live infer and load a typed profile. Live infer is for the one-sentence path and for showing the judge the intake.

### Rank / explain

1. Route: `POST /api/rank` after retrieve. Input: Company profile + `candidates[]` (id, source, title, agency, value, deadline, eligibility text, truncated synopsis, join keys). No web search. No "find more programs" tool.
2. Same Haiku 4.5, `Output.object` / `Output.array` of `{ id, fit, why, concerns, nextStep }`.
3. Prompt states: you may only cite IDs from this list; Fit labels only; program / agency / value / deadline are copied from retrieve, not rewritten; if the set is thin or government-only, lead with `probably not` and the State-lane rows.
4. Server join: drop unknown IDs; stamp card fields from the retrieve row; never display a model-authored program name.
5. Empty or all-dropped result is a valid map: honest case 5, Utah companions, no hallucinated federal card.

### When to touch Sonnet 5

Only after a fixture walkthrough shows Haiku why-copy is generic or it fails to separate case 1 (SBIR / NIH / NSF) from case 5 (poor federal fit). Swap the rank model string. Keep infer on Haiku. Do not "try Grok" in the same hour.

---

## Grounding: retrieved IDs only

One Opportunity Map card is a join ([four-federal-apis.md](https://github.com/craigcossairt/startup-state-2/blob/research/four-federal-apis/docs/research/four-federal-apis.md) on `research/four-federal-apis`). The LLM never owns identity.

Stable card id: `source:nativeId`

| Source | Native id | What the model may see | What the model may not write |
|---|---|---|---|
| Grants.gov | `grants:{search2 id}` | title, agency, closeDate, eligibility codes, truncated synopsis, awardCeiling if not `"none"` | a new opportunity number, a made-up ceiling |
| SAM | `sam:{assistanceListingId}` | title, org, assistance types, applicant types | a live NOFO deadline (catalog has none) |
| USAspending | `usa:{Award ID}` | recipient, amount, CFDA, NAICS | an open application window (history only) |
| SBIR CSV | `sbir:{agency_tracking_number}` | firm, amount, abstract, agency | a solicitation dollar amount (CSV awards have amounts; solicitations do not) |
| GOEO / State | `goeo:{external_id}` | title, description, link | a nonresident-open flag (the table has none) |

Rules in code, not only in the prompt:

1. Build `allowedIds = Set(candidates.map(c => c.id))` before the call.
2. Put that list in the schema description and in the user message.
3. After parse, `ranked = ranked.filter(r => allowedIds.has(r.id))`.
4. Card chrome (program, agency, value, deadline, similar awardees) comes from the retrieve join, not from the model text.
5. If Grants.gov `awardCeiling` is `"none"` or missing, the card says the value is unknown. The model does not fill it.
6. Case 5: empty posted+forecast + government-only SAM applicant types is a `probably not`, not a cue to loosen keywords inside the LLM.

This is the same grounding idea as Part 1 chat (`lookupResource` + "never invent a program"), minus tool use. Rank does not need tools. Tools would let the model wander off the retrieved set.

---

## Cache: programs vs model output

Two different stores. Mixing them is how a demo shows a dead NOFO with a confident why.

### Must cache (programs — source of truth)

From [Four federal APIs](https://github.com/craigcossairt/startup-state-2/issues/7), before Friday:

| Store | Why | Refresh |
|---|---|---|
| SAM Active listings JSON | 10 req/day without a Role; no keyword | Once, after a keyed dump. Zero live SAM on Friday. |
| SBIR `award_data.csv` | API 403 | Once. Filter locally. |
| Grants.gov posted+forecast slice per fixture + `fetchOpportunity` for kept ids | search2 has no value field; 429 is real | Thursday night + Friday morning. |
| USAspending slices (CFDA / NAICS / Utah) | empty-reply limiter; keyword noise | Same window, `limit` 10–25. |
| GOEO 213 + the six title/description keys | State lane has no live opportunity API | Snapshot. See [GOEO table categories](https://github.com/craigcossairt/startup-state-2/issues/6) and [Utah state APIs](https://github.com/craigcossairt/startup-state-2/issues/10). |

Retrieve reads these files (plus live Grants.gov / USAspending if the slice is warm). The LLM never sees a program that is not in this store.

### May cache (model output — disposable)

| Output | Key | TTL | Invalidate when |
|---|---|---|---|
| Infer JSON | hash of the one sentence (or fixture id) | session / localStorage | User edits a field |
| Rank JSON | `profileHash + sha256(sorted allowedIds)` | hours, demo only | Retrieve refresh, profile edit, or any id enters/leaves the set |
| Fixture rank | fixture id | until Thursday/Friday retrieve refresh | New Grants.gov slice |

Never serve a cached rank whose `allowedIds` are not a subset of the current retrieve set. Re-join chrome from programs even when why-copy is reused.

### Do not bother

- Anthropic prompt cache on infer (under 4,096 tokens).
- Prompt cache on rank across fixtures (each retrieve set is different, so the prefix will not match).
- Prompt cache *within* one fixture if the judge re-ranks the same id set: optional, 5-minute TTL, breakpoint on the last retrieved-card block, not on the user message. Nice if we already have ≥4,096 tokens of identical prefix. Not the grounding strategy.
- Caching rank as if it were SAM. It is not.

---

## Cost and latency for five fixtures

**Not measured this session.** Priced from [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing) with the token shapes below. Label: estimate, not a run.

### Token shape (assumptions)

**Infer (live, one sentence):** ~1,000 input (system + schema + sentence) + ~300 output. Fixtures can skip this.

**Rank (20 retrieved cards):** ~1,500 system/schema + ~400 profile + 20 × ~350 card tokens ≈ 8,900 input + ~2,000 output (8–12 items × why/concerns/next).

### Dollars (list price, no cache hits)

| Pass | Haiku 4.5 | Sonnet 5 | Sonnet 4.6 (do not pick) | Grok 4.3 (no key) |
|---|---:|---:|---:|---:|
| 5 live infers | ~$0.013 | ~$0.025 | ~$0.038 | ~$0.010 |
| 5 ranks (20 cards) | ~$0.095 | ~$0.189 | ~$0.284 | ~$0.081 |
| **Five-fixture judged path** (skip infer on fixtures, 5 ranks) | **~$0.10** | ~$0.19 | ~$0.28 | ~$0.08 |
| Messy day (15 ranks + 10 infers) | ~$0.31 | ~$0.62 | ~$0.93 | ~$0.26 |

Even a sloppy demo day is pocket change on the Anthropic key. Cost is not why we pick Haiku. Latency and "do not invent a program" are.

### Latency (qualitative)

Anthropic labels Haiku **Fastest**, Sonnet 5 **Fast**, Opus **Moderate**, Fable **Slower**. Part 1 budgeted 20s for infer and 60s for chat. Rank of ~10k tokens should stay inside a 30–60s route `maxDuration` on Fluid Compute. Unproven in this session: actual TTFT. If rank feels slow on stage, stream `partialOutputStream` so cards appear before the last why-sentence.

Vercel Hobby function limits still apply. Keep rank on Node, not Edge, same as Part 1.

### Rate limits

Official Start-tier Haiku 4.5: 1,000 RPM / 2M ITPM / 400k OTPM. Five fixtures plus a handful of judge retries will not approach that. Cached input does not count toward ITPM on Haiku 4.5. Spend cap on Start is $500/month, irrelevant at these dollars.

---

## What we are not choosing, and why

| Option | Why not, this weekend |
|---|---|
| Anthropic Sonnet 5 as default rank | 2× input, 2× output vs Haiku. Use only if Haiku why-copy fails the walkthrough. |
| Anthropic Sonnet 4.6 | Legacy. More expensive than Sonnet 5. Part 1 history, not a new default. |
| Opus 5 / Fable 5 | 5–10× Haiku. Slower. Rank is not agentic coding. |
| Vercel AI Gateway as the bill | Free tier is a model subset; BYOK needs paid credits; Anthropic key already works. Revisit if Friday credits are Gateway credits *and* Haiku is in the pool. |
| xAI Grok 4.3 / 4.6 / grok-build | Real API, real structured outputs, no key in this repo, no published event credit. |
| OpenAI / Gemini / Bedrock / Vertex | Not in Part 1 env. Not required by the brief. Inventing a provider. |
| Letting the rank model call Grants.gov | Breaks retrieve-then-rank. The model would search, then "find" a program. |
| Caching rank without the id-set hash | Stale why on a closed NOFO. The failure mode the brief punishes. |

---

## Spec hooks (for the map, not this ticket)

When the locked spec is written, it should say:

- Infer: Anthropic Haiku 4.5, temperature 0, Zod + sanitize, `missing[]` drives Intake.
- Rank: same model, retrieved IDs only, server-side ID allowlist, Fit labels only.
- Programs cache is required; model-output cache is optional and keyed by profile + id set.
- Exact prompts stay a later ticket (map: "Exact prompts for infer, rank, and explain").

---

## Still unproven

- Live TTFT / token counts on the five official fixture sentences (no Part 2 app yet).
- Whether Craig's Anthropic org is Start vs Evaluation (limits differ; dollars do not).
- Dollar amount of Anthropic "small free credit" and of Vercel Gateway's monthly free credit.
- Whether `anthropic/claude-haiku-4.5` is on today's Gateway free-tier list.
- Whether Friday will hand out Anthropic, Gateway, or xAI credits. The public event page does not say.
- Company profile enums ([issue 8](https://github.com/craigcossairt/startup-state-2/issues/8)). Infer cannot be typed until that lands.
- Whether Haiku why-copy is good enough for the 25% matching + 20% insight rubric. That is a walkthrough, not a pricing question.

---

## Source list

- Part 1 infer: `C:\Users\Craig Cossairt\startup-state\src\app\api\playbook\infer-persona\route.ts` (`claude-haiku-4-5-20251001`, temperature 0, enum sanitize).
- Part 1 env / packages: `.env.example` (`ANTHROPIC_API_KEY` only for AI); `package.json` (`ai` ^6.0.176, `@ai-sdk/anthropic` ^3.0.76, `@anthropic-ai/sdk` ^0.95.1).
- Part 1 chat (not this product): `src\app\api\chat\route.ts` (`anthropic("claude-sonnet-4-6")`).
- Federal retrieve / cache: `origin/research/four-federal-apis` → `docs/research/four-federal-apis.md`.
- Anthropic: [models overview](https://platform.claude.com/docs/en/about-claude/models/overview), [pricing](https://platform.claude.com/docs/en/about-claude/pricing), [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [rate limits](https://platform.claude.com/docs/en/api/rate-limits).
- Vercel: [AI Gateway](https://vercel.com/docs/ai-gateway), [AI Gateway pricing](https://vercel.com/docs/ai-gateway/pricing), [Haiku 4.5 on Gateway](https://vercel.com/ai-gateway/models/claude-haiku-4.5), [AI SDK structured data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data).
- xAI: [pricing](https://docs.x.ai/developers/pricing), [structured outputs](https://docs.x.ai/developers/model-capabilities/text/structured-outputs).
- Event / brief: [aibuilderday.com](https://www.aibuilderday.com/), [GOED brief](https://startupstate-hackathon-brief.lovable.app/), `docs/briefs/goed-opportunity-finder.md`, `docs/about-me.md`.
