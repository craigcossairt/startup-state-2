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
| Mapbox or Supabase public vars are in Vercel but `/startups` still shows the schematic plot | `NEXT_PUBLIC_*` is inlined at build time. A deploy that finished before the vars were saved does not see them | Redeploy the preview or production after saving the vars. Production also needs this PR merged. Empty Supabase tables still fall back to `data/catalog/` | 2026-08-15 | leftover surfaces |
| Cannot run `supabase/schema.sql` from the cloud VM | Marketplace `POSTGRES_*` secrets are type=sensitive: API decrypt and `vercel env run` inject empty values. Direct `db.<ref>.supabase.co` is IPv6-only and unreachable here | Apply during the Vercel Production build (`scripts/apply-catalog-schema.mjs`). Confirm with REST `PGRST205` gone and counts 213/220 | 2026-08-15 | leftover surfaces |
