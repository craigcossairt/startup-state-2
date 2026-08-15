# Supabase for leftover surfaces

Project: `jcyiqxdneyamxhkvhfvv`

The app reads `resources` and `startups` when `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. If they are missing, or the tables are
empty, it falls back to `data/catalog/*.json`.

## What you run

1. Open the SQL editor.
2. Paste and run `schema.sql`.
3. In Vercel (Production and Preview) set:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://jcyiqxdneyamxhkvhfvv.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon public key
4. Redeploy the Vercel preview (or production) after those vars are saved.
   `NEXT_PUBLIC_*` is inlined at build time. A deploy that finished before
   the save will not see them.
5. Optional: Table Editor import of `data/catalog/resources.json` and
   `data/catalog/startups.json`. Column names must match the JSON keys
   (`external_id`, `is_hiring`, `linkedin_url`). Empty tables still fall
   back to the committed JSON.

Do not add the service role key to Vercel as a `NEXT_PUBLIC_` var. The
next number after the env steps is 6.

Claim and admin stay out until RLS write policies and an auth gate exist.
The Part 1 tracked migration is not this schema. Do not paste it blindly.
