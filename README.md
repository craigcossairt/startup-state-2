# Startup State 2

Private GOED submission for [AI Builder Day Part 2](https://www.aibuilderday.com/) (Aug 14-15 2026). Scaffolded from [trellis](https://github.com/craigcossairt/trellis) after the bounty brief was posted.

**Product:** Government Opportunity Finder. A founder describes a company and gets federal and Utah resources they should know about, with a why.

- Brief: [`docs/briefs/goed-opportunity-finder.md`](docs/briefs/goed-opportunity-finder.md)
- Slice: [`docs/primary-bounty.md`](docs/primary-bounty.md)
- What to steal from Part 1: [`docs/briefs/startup-state-reuse.md`](docs/briefs/startup-state-reuse.md)
- Official brief: [startupstate-hackathon-brief.lovable.app](https://startupstate-hackathon-brief.lovable.app/)

This is not a fork of [craigcossairt/startup-state](https://github.com/craigcossairt/startup-state).

## Status

- Repo: private, `main`
- Stage: weekend build
- Stack: Next.js 16 / TypeScript / Tailwind on Vercel
- Local: `pnpm install` then `pnpm dev`
- Tests: `pnpm test`
- Issues: https://github.com/craigcossairt/startup-state-2/issues

Needs `XAI_API_KEY` in `.env` for live infer and rank (Grok 4.6). Fixture clicks skip infer and still need the key for rank.
