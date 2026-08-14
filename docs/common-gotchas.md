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
