# Weekend cache

Pulled for [SAM Role and Thursday cache](https://github.com/craigcossairt/startup-state-2/issues/12). Do not live-hit SAM or SBIR.gov APIs on Friday. Grants.gov search2 and USAspending V2 may stay live with backoff.

## In git

| Path | What |
| --- | --- |
| `grants-gov/*.json` | search2 slices for the five fixtures (25 rows each, posted+forecasted, small-business eligibility). Pulled 2026-08-14 ~00:55 local. |

## Local only (gitignored)

| Path | How |
| --- | --- |
| `data/cache/sbir/award_data.csv` | `curl -L -o data/cache/sbir/award_data.csv https://data.www.sbir.gov/awarddatapublic/award_data.csv` (~351 MB). HEAD 200 on 2026-08-14. API still 403. |
| `data/cache/sam/active.json` | Live API max `pageSize` is **100** (docs say 1000). No-Role cap is 10 req/day. Full Active catalog is 2,865 listings (29 pages). 2026-08-14 pull: pages 1–8, **800 / 2,865**. Finish remaining pages on later days, or skip: SAM is join-only. |

`SAM_API_KEY` lives in Bitwarden, then `.env`. Never commit it. No SAM Role: no registered entity. Cap stays 10 req/day.

## Checklist

1. SAM personal account + Public API key — done. No Role.
2. Key in Bitwarden and `.env` — done.
3. SAM Active dump — partial 800 / 2,865 at `data/cache/sam/active.json`. Remaining pages optional.
4. SBIR CSV — done, `data/cache/sbir/award_data.csv`, 367,551,355 bytes.
5. Grants.gov fixture slices — on `main` under `data/cache/grants-gov/`.
