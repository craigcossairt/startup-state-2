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

`SAM_API_KEY` lives in Bitwarden, then `.env`. Never commit it.

## Craig checklist (still open)

1. SAM.gov personal account → Public API key at [sam.gov/profile/details](https://sam.gov/profile/details) → attach a Role (10/day → 1000/day).
2. Store the key in Bitwarden. Put `SAM_API_KEY=` in `.env`.
3. Page the Active dump into `data/cache/sam/active.json`.
4. Download the SBIR CSV into `data/cache/sbir/award_data.csv`.
5. Comment on the ticket: Bitwarden item name, dump paths, row counts.
