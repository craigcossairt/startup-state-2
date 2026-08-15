# Startup State 2

GOED Government Opportunity Finder for AI Builder Day Part 2. A founder describes a company and gets federal and Utah programs ranked by fit, with a why. New app wearing the Startup State brand.

Live: https://startup-state-2.vercel.app

## Surfaces

- `/` Intake. One sentence or a fixture click, then infer, then missing fields.
- `/map` Opportunity Map. Ranked cards. Fit language only. Never eligible.
- Leftover siblings sit beside Intake: Playbook, Resources, Startups, Careers, News, Swag, Claim, and `/admin` Operations.
- Navigator FAB (Ask the Navigator, Startup State mark) answers from the ranked Opportunity Map, the 19 playbook steps, and leftover pages. Hidden on claim and admin.

Home stays Intake. `/map` stays the Opportunity Map.

## Local

```bash
pnpm install
pnpm dev
pnpm test
pnpm lint
```

Needs `XAI_API_KEY` for live infer and rank (Grok). Fixture clicks skip infer and still need the key for rank.

## Env

- `XAI_API_KEY` - infer and rank
- `SAM_API_KEY` - optional `sam_opps` retrieve; fail soft if missing
- `NEXT_PUBLIC_MAPBOX_TOKEN` - optional tiles on `/startups`; the schematic plot still shows without it
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` - optional live leftover catalogs; empty tables fall back to `data/catalog/`

`GH_TOKEN` is for GitHub CLI, not this app.

## Vercel

Project: [vercel.com/cossairt/startup-state-2](https://vercel.com/cossairt/startup-state-2). Pushes to `main` deploy Production.

Public production URL: https://startup-state-2.vercel.app  
Preview and `*.vercel.app` deployment URLs stay behind Vercel SSO.

## Docs

- Brief: [`docs/briefs/goed-opportunity-finder.md`](docs/briefs/goed-opportunity-finder.md)
- Slice: [`docs/primary-bounty.md`](docs/primary-bounty.md)
- Issues: https://github.com/craigcossairt/startup-state-2/issues
