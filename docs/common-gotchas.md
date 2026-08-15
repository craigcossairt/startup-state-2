# Common Gotchas

Symptom → root cause → fix patterns discovered in this project. Agents: append a row after every
bug fix (see AGENTS.md § Autonomous Housekeeping). Check this table FIRST when diagnosing a bug -
the symptom may already be documented.

Keep entries terse: future sessions are the consumer and they have a limited attention budget.
Include a commit SHA and issue reference when known.

| Symptom | Root Cause | Fix | Date | Ref |
|---|---|---|---|---|
| React warns about two children with the same key on a Ranked card | USAspending often returns the same recipient name twice; the list key was `source:name` | Key similar awardees with source, name, year, and index | 2026-08-14 | history attach |
| Ask whatTheyDo / hqState vanish after one character | onChange set status to `known`, so `missingMustHaves` dropped the field and unmounted the input | Draft with `applyMustHaveDraft` (keep status); promote to known on submit | 2026-08-14 | Intake |
| Confirm listed inferred fields as JSON and they were not editable | Confirm rendered `JSON.stringify(value)` instead of inputs | Shared `MustHaveField` editors; Continue still runs `confirmInferredMustHaves` | 2026-08-14 | Intake |
| Cursor cloud has no SBIR/SAM history | Full dumps are gitignored; cloud only clones git | Commit `utah-awards.json` and `listings-slice.json`; loaders prefer those | 2026-08-14 | history / SAM join |
| SBIR similar awardees empty even with `award_data.csv` | Loader used col 28 (Zip) as State | State is col 27, city is col 26 | 2026-08-14 | `src/lib/history/sbir.ts` |
| Vercel Production build fails TypeScript | Bonus helper omitted `description`; `must-haves` and rank-id Map used branded `Opportunity.id` against plain strings | Fill `description: null`; spread profile updates; `Map<string, Opportunity>` | 2026-08-14 | `pnpm build` |
| Vercel map has empty Grants.gov / GOEO / history | `dataPath()` is dynamic, so file tracing drops `data/` | `outputFileTracingIncludes: { "/*": ["./data/**/*"] }` | 2026-08-14 | `next.config.ts` |
| Returning to /map always waits on rank | OpportunityMap remounts on client navigation and POSTed `/api/rank` with no cache | Cache the ranked payload in sessionStorage keyed by company must-haves plus retrieve chips. Restore last chips from the cache before fetch. Fit chips stay out of the key. | 2026-08-15 | map cache |
| Watch this listing did not match the brief | Alerts stored per-opportunity watches | Subscribe to the current company search, keep seen retrieved ids, flag new ids on the next map run. Email is not wired. | 2026-08-15 | saved search |
| Import-fence `/News/` fails on the official footer | "Newsletter" matches `News` | Match leftover routes (`/news`), not the word News | 2026-08-15 | site-chrome test |
| Leftover-nav fence stayed green after renaming `SITE_NAV` | `grep SITE_NAV` matches `SITE_NAV_BROKEN` | Use `grep -w SITE_NAV` | 2026-08-15 | import fences |
| Navigator FAB visible but clicks do nothing on `127.0.0.1:3000` | Next 16 blocks `/_next` dev resources from `127.0.0.1` (treats it as cross-origin vs `localhost`); the button is SSR HTML with no hydrated `onClick` | Set `allowedDevOrigins: ['127.0.0.1']` or open `http://localhost:3000`. Do not change the FAB. | 2026-08-15 | site chrome |
| Mapbox or Supabase public vars are in Vercel but `/startups` still shows the schematic plot | `NEXT_PUBLIC_*` is inlined at build time, so the client Map had an empty token. Saving the var without a redeploy does not update that bundle. A token named `MAPBOX_TOKEN` was also ignored. | Pass a `pk.` token from the server as a prop (`readMapboxPublicToken`). Accept `NEXT_PUBLIC_MAPBOX_TOKEN` or `MAPBOX_TOKEN`. Redeploy after saving. Empty Supabase tables still fall back to `data/catalog/` | 2026-08-15 | leftover surfaces |
| Playbook path put Growing first for Healthcare AI | `orderPlaybookStages` sorted the matching persona stage to the front | Keep Thinking, Starting, Growing, Closing. Mark "Your stage". Do not reorder | 2026-08-15 | leftover playbook |
| Cannot run `supabase/schema.sql` from the cloud VM | Marketplace `POSTGRES_*` secrets are type=sensitive: API decrypt and `vercel env run` inject empty values. Direct `db.<ref>.supabase.co` is IPv6-only and unreachable here | Apply during the Vercel Production build (`scripts/apply-catalog-schema.mjs`). Confirm with REST `PGRST205` gone and counts 213/220 | 2026-08-15 | leftover surfaces |
| Production build reached Supabase then died on `self-signed certificate in certificate chain` | `pg` 8 treats DSN `sslmode=require` as `verify-full`, which overrides `rejectUnauthorized: false` | Strip `sslmode` from the DSN and reconnect with `sslmode=no-verify` | 2026-08-15 | leftover surfaces |
| Playbook and Resources 500 after the leftover test-case bar | The bar is a client component. Importing `load-fixture` pulled `node:fs` into the browser bundle | Keep leftover fixture ids on `FIXTURE_CHIPS` in `copy.ts`. Do not import `load-fixture` from client helpers | 2026-08-15 | leftover test cases |
| Leftover "Email me when this changes" said saved on this device but a reload lost it | `submitLeftoverWatch` only validated and returned `mailed: false` | `persistLeftoverWatch` writes `startup_state.leftover_watch` in localStorage. Mail stays unwired | 2026-08-15 | leftover watch |
| Dependabot still flags `postcss@8.4.31` / `sharp@0.34.5` after Next 16.2.11 | Next 16.2 pins those exact/range deps. Forcing `sharp@0.35` under 16.2 breaks Vercel NFT (`sharp/lib/index.js` vs `dist/index.cjs`) | Bump Next to 16.3.x, which ships postcss 8.5.23 and sharp ^0.35.3 plus the NFT fix | 2026-08-15 | Dependabot |
| `next build` on 16.3.1 fails TS on `match-resources.test.ts` | Test used `grant:1`. `Opportunity.id` is `` `${source}:${string}` `` | Use `grants_gov:1`. 16.2.11 typecheck missed it; 16.3.1 does not | 2026-08-15 | Dependabot |
| `next build` dies on `/playbook/[stage]/[step]` with missing Suspense | `YouParamLink` calls `useSearchParams` in the page tree outside a boundary | Wrap the hook in `YouParamLink` itself. YouBar on that page was already wrapped | 2026-08-15 | leftover playbook |
| Fixture-2/4 maps were all HHS | `search2` sent `eligibilities: 23` | Drop eligibility. Recache with `scripts/recache-grants-gov.mjs` | 2026-08-15 | Grants.gov retrieve |
| Nucleus Grow showed SBIR awardees | `isSbirShaped` scanned description | Match program and opportunityNumber only, and only on federal cards | 2026-08-15 | history attach |
| Directory chip dropped every federal row | `capRetrieved` was curated, then GOEO, then federal | Reserve 15 federal slots before leftover GOEO fills the cap | 2026-08-15 | retrieve cap |
| Similar awardees existed on the payload but not on the card | `RankedOpportunityCard` never read `similarAwardees` | Paint them after concerns. Empty copy is None attached | 2026-08-15 | ranked card |
