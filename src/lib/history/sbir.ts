import { createReadStream, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { dataPath } from "@/lib/paths";
import type { CompanyProfile } from "@/lib/types/company-profile";
import type { HistoryAttachment } from "@/lib/types/opportunity";

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

async function loadUtahSbirIndex(): Promise<HistoryAttachment[]> {
  if (utahIndex) return utahIndex;
  if (indexing) return indexing;
  const file = dataPath("cache", "sbir", "award_data.csv");
  if (!existsSync(file)) {
    utahIndex = [];
    return utahIndex;
  }
  indexing = (async () => {
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
      const state = (cols[28] ?? "").toUpperCase();
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
        city: cols[27] || undefined,
        summary: cols[1] || undefined,
      });
    }
    lines.close();
    stream.destroy();
    utahIndex = collected;
    return collected;
  })();
  return indexing;
}

export async function loadSbirAwards(
  profile: CompanyProfile,
  limit = 6,
): Promise<HistoryAttachment[]> {
  const rows = await loadUtahSbirIndex();
  if (rows.length === 0) return [];
  const tokens = [
    ...(profile.sectors.value ?? []),
    ...(profile.technologies.value ?? []),
  ]
    .map((token) => token.toLowerCase())
    .filter((token) => token.length > 2);
  const matched = rows.filter((row) => {
    if (tokens.length === 0) return true;
    const haystack = `${row.summary ?? ""} ${row.name}`.toLowerCase();
    return tokens.some((token) => haystack.includes(token));
  });
  return (matched.length > 0 ? matched : rows).slice(0, limit);
}
