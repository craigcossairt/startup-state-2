# Supabase for leftover surfaces

Project: `jcyiqxdneyamxhkvhfvv`

The app reads `resources` and `startups` when `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. If they are missing, or the tables are
empty, it falls back to `data/catalog/*.json`.

## What applies the schema

`pnpm build` runs `scripts/apply-catalog-schema.mjs` first. On Vercel
Production that process sees `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` from
the marketplace integration, creates `public.resources` and `public.startups`
if needed, and seeds them from `data/catalog/*.json` when the tables are
empty. Local, CI, and Preview builds skip the apply when those URLs are
absent.

You can still paste `schema.sql` in the SQL editor if you want the tables
before the next production deploy. Do not paste the Part 1
`0001_initial_schema.sql`.

## Vercel public vars

In Vercel (Production and Preview) set:

- `NEXT_PUBLIC_SUPABASE_URL` = `https://jcyiqxdneyamxhkvhfvv.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon public key

Redeploy after those vars are saved. `NEXT_PUBLIC_*` is inlined at build
time. A deploy that finished before the save will not see them.

Do not add the service role key to Vercel as a `NEXT_PUBLIC_` var.

Claim and admin stay out until RLS write policies and an auth gate exist.
