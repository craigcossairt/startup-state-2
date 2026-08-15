import { createReadStream, existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { dataPath } from "@/lib/paths";
import type { CompanyProfile } from "@/lib/types/company-profile";
import type { HistoryAttachment } from "@/lib/types/opportunity";

type SbirSlice = {
  awards?: HistoryAttachment[];
};

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
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

let utahIndex: HistoryAttachment[] | null = null;
let indexing: Promise<HistoryAttachment[]> | null = null;

function loadCommittedUtahSlice(): HistoryAttachment[] {
  const file = dataPath("cache", "sbir", "utah-awards.json");
  if (!existsSync(file)) return [];
  const parsed = JSON.parse(readFileSync(file, "utf8")) as SbirSlice;
  return (parsed.awards ?? []).filter(
    (row) => row.source === "sbir_csv" && row.state === "UT" && row.name,
  );
}

async function loadUtahSbirFromCsv(): Promise<HistoryAttachment[]> {
  const file = dataPath("cache", "sbir", "award_data.csv");
  if (!existsSync(file)) return [];
  const collected: HistoryAttachment[] = [];
  const stream = createReadStream(file, { encoding: "utf8" });
  const lines = createInterface({ input: stream, crlfDelay: Infinity });
  let header = true;
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
    collected.push({
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
  return collected;
}

async function loadUtahSbirIndex(): Promise<HistoryAttachment[]> {
  if (utahIndex) return utahIndex;
  if (indexing) return indexing;
  indexing = (async () => {
    const slice = loadCommittedUtahSlice();
    utahIndex = slice.length > 0 ? slice : await loadUtahSbirFromCsv();
    return utahIndex;
  })();
  return indexing;
}

export function historyTokens(profile: CompanyProfile): string[] {
  return [
    ...(profile.sectors.value ?? []),
    ...(profile.technologies.value ?? []),
  ]
    .map((token) => token.toLowerCase())
    .filter((token) => token.length >= 2);
}

export async function loadSbirAwards(
  profile: CompanyProfile,
  limit = 6,
): Promise<HistoryAttachment[]> {
  const rows = await loadUtahSbirIndex();
  if (rows.length === 0) return [];
  const tokens = historyTokens(profile);
  const matched = rows.filter((row) => {
    if (tokens.length === 0) return true;
    const haystack = `${row.summary ?? ""} ${row.name}`.toLowerCase();
    return tokens.some((token) => haystack.includes(token));
  });
  return matched.slice(0, limit);
}
