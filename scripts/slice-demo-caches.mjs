/**
 * Build committed demo slices from local gitignored dumps.
 * Run on a machine that already has award_data.csv and active.json.
 */
import { createReadStream, existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function collectAlns() {
  const aln = new Set();
  const dir = "data/cache/grants-gov";
  for (const name of [
    "fixture-1-open.json",
    "fixture-1-sbir.json",
    "fixture-2-open.json",
    "fixture-2-sbir.json",
    "fixture-3-open.json",
    "fixture-3-sbir.json",
    "fixture-4-open.json",
    "fixture-4-sbir.json",
    "fixture-5-open.json",
    "fixture-5-sbir.json",
  ]) {
    const parsed = JSON.parse(readFileSync(`${dir}/${name}`, "utf8"));
    for (const hit of parsed.data?.oppHits ?? []) {
      for (const value of [...(hit.cfdaList ?? []), ...(hit.alnist ?? [])]) {
        aln.add(String(value));
      }
    }
  }
  return aln;
}

async function sliceSbir() {
  const file = "data/cache/sbir/award_data.csv";
  if (!existsSync(file)) {
    throw new Error("Missing local dump: data/cache/sbir/award_data.csv");
  }
  const stream = createReadStream(file, { encoding: "utf8" });
  const lines = createInterface({ input: stream, crlfDelay: Infinity });
  let header = true;
  const awards = [];
  for await (const line of lines) {
    if (header) {
      header = false;
      continue;
    }
    const cols = parseCsvLine(line);
    const state = (cols[27] ?? "").toUpperCase();
    if (state !== "UT") continue;
    const company = cols[0];
    if (!company) continue;
    const year = Number(cols[16]);
    const amount = Number((cols[17] ?? "").replace(/,/g, ""));
    awards.push({
      source: "sbir_csv",
      name: company,
      amountUsd: Number.isFinite(amount) ? amount : undefined,
      year: Number.isFinite(year) ? year : undefined,
      state,
      city: cols[26] || undefined,
      summary: cols[1] || undefined,
    });
  }
  lines.close();
  stream.destroy();
  writeFileSync(
    "data/cache/sbir/utah-awards.json",
    `${JSON.stringify({ pulled: "2026-08-14", count: awards.length, awards }, null, 2)}\n`,
  );
  return awards.length;
}

function sliceSam() {
  const file = "data/cache/sam/active.json";
  if (!existsSync(file)) {
    throw new Error("Missing local dump: data/cache/sam/active.json");
  }
  const wanted = collectAlns();
  const parsed = JSON.parse(readFileSync(file, "utf8"));
  const listings = [];
  const found = new Set();
  for (const listing of parsed.assistanceListingsData ?? []) {
    const id = listing.assistanceListingId;
    if (!id || !wanted.has(id)) continue;
    found.add(id);
    listings.push({
      assistanceListingId: id,
      title: listing.title,
      overview: {
        objective: listing.overview?.objective,
        assistanceListingDescription: listing.overview?.assistanceListingDescription,
      },
    });
  }
  writeFileSync(
    "data/cache/sam/listings-slice.json",
    `${JSON.stringify(
      {
        pulled: "2026-08-14",
        wantedAlns: [...wanted].sort(),
        matched: listings.length,
        missingAlns: [...wanted].filter((id) => !found.has(id)).sort(),
        assistanceListingsData: listings,
      },
      null,
      2,
    )}\n`,
  );
  return { wanted: wanted.size, matched: listings.length, missing: wanted.size - found.size };
}

const sbirCount = await sliceSbir();
const sam = sliceSam();
console.log(JSON.stringify({ sbirUtahAwards: sbirCount, sam }, null, 2));
