import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SEARCH2_URL = "https://api.grants.gov/v1/api/search2";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const SLICES = [
  {
    file: "data/cache/grants-gov/fixture-1-sbir.json",
    keyword: "SBIR STTR healthcare",
  },
  {
    file: "data/cache/grants-gov/fixture-1-open.json",
    keyword: "healthcare AI administrative burden nurses",
  },
  {
    file: "data/cache/grants-gov/fixture-2-sbir.json",
    keyword: "SBIR aerospace manufacturing",
  },
  {
    file: "data/cache/grants-gov/fixture-2-open.json",
    keyword: "aerospace manufacturing advanced components",
  },
  {
    file: "data/cache/grants-gov/fixture-3-sbir.json",
    keyword: "SBIR water climate sensors",
  },
  {
    file: "data/cache/grants-gov/fixture-3-open.json",
    keyword: "water climate sensors AI",
  },
  {
    file: "data/cache/grants-gov/fixture-4-sbir.json",
    keyword: "SBIR cyber threat detection",
  },
  {
    file: "data/cache/grants-gov/fixture-4-open.json",
    keyword: "cybersecurity threat detection",
  },
  {
    file: "data/cache/grants-gov/fixture-5-open.json",
    keyword: "workforce youth education marketplace",
  },
  {
    file: "data/cache/grants-gov/fixture-5-sbir.json",
    keyword: "SBIR education youth",
  },
];

async function search2(keyword) {
  let delayMs = 1000;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(SEARCH2_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        keyword,
        rows: 25,
        oppStatuses: "forecasted|posted",
      }),
    });
    if (response.ok) {
      return { http: response.status, payload: await response.json() };
    }
    if (response.status !== 429 && response.status < 500) {
      throw new Error(`search2 ${keyword} failed: ${response.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    delayMs *= 2;
  }
  throw new Error(`search2 ${keyword} exhausted retries`);
}

function agencySummary(hits) {
  const counts = new Map();
  for (const hit of hits) {
    const key = hit.agencyCode || hit.agency || "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([code, n]) => `${code}:${n}`)
    .join(", ");
}

const manifest = [];
for (const slice of SLICES) {
  const { http, payload } = await search2(slice.keyword);
  const hits = payload.data?.oppHits ?? [];
  writeFileSync(join(root, slice.file), `${JSON.stringify(payload, null, 2)}\n`);
  manifest.push({
    file: slice.file,
    keyword: slice.keyword,
    http,
    hitCount: payload.data?.hitCount ?? hits.length,
    rows: 25,
    firstId: hits[0]?.id ?? null,
    agencies: agencySummary(hits),
  });
  console.log(
    `${slice.file} hits=${hits.length} total=${payload.data?.hitCount} first=${hits[0]?.id} ${agencySummary(hits)}`,
  );
}

writeFileSync(
  join(root, "data/cache/grants-gov/MANIFEST.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log("wrote MANIFEST.json");
