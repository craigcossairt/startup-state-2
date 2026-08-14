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
