import { readFileSync } from "node:fs";
import { dataPath } from "@/lib/paths";
import type { GoeoKey, Opportunity } from "@/lib/types/opportunity";
import { mintOpportunityId } from "./ids";

export type GoeoRow = {
  external_id: string;
  title: string;
  description: string;
  link: string | null;
};

const TITLE_MATCHERS: Record<GoeoKey, (title: string) => boolean> = {
  "sbir-help": (title) => title === "utah innovation center",
  contracting: (title) => title.includes("apex accelerator"),
  "state-capital": (title) =>
    title.includes("usbci") ||
    title.includes("utah microloan") ||
    title.startsWith("get started"),
  workforce: (title) =>
    title === "utah department of workforce services" ||
    title === "talent ready utah" ||
    title === "custom fit training" ||
    title === "utah mep",
  counseling: (title) =>
    title.includes("small business development center") ||
    title === "score" ||
    title === "small business administration (sba)" ||
    title === "sba thrive",
  trade: (title) =>
    title === "world trade center utah" ||
    title === "u.s. commercial service",
};

const INSTRUMENT_BY_TITLE: Array<{ test: (title: string) => boolean; instrument: Opportunity["instrument"] }> = [
  { test: (t) => t.includes("usbci") || t.includes("microloan"), instrument: "loan" },
  { test: (t) => t.startsWith("get started"), instrument: "grant" },
  { test: (t) => t.includes("apex"), instrument: "contracting_help" },
  {
    test: (t) =>
      t.includes("innovation center") ||
      t.includes("sbdc") ||
      t === "score" ||
      t.includes("small business administration") ||
      t.includes("sba thrive"),
    instrument: "counseling",
  },
];

let cachedRows: GoeoRow[] | null = null;

export function loadGoeoTable(): GoeoRow[] {
  if (cachedRows) return cachedRows;
  const raw = readFileSync(dataPath("goeo", "resources.json"), "utf8");
  cachedRows = JSON.parse(raw) as GoeoRow[];
  return cachedRows;
}

export function goeoRowsForKeys(keys: GoeoKey[], rows = loadGoeoTable()): GoeoRow[] {
  const seen = new Set<string>();
  const matched: GoeoRow[] = [];
  for (const row of rows) {
    const title = row.title.toLowerCase();
    const fires = keys.some((key) => TITLE_MATCHERS[key](title));
    if (!fires || seen.has(row.external_id)) continue;
    seen.add(row.external_id);
    matched.push(row);
  }
  return matched;
}

export function leftoverGoeoRows(alreadyIds: Set<string>, rows = loadGoeoTable()): GoeoRow[] {
  return rows.filter((row) => !alreadyIds.has(mintOpportunityId("goeo", row.external_id)));
}

export function mapGoeoRowToOpportunity(row: GoeoRow): Opportunity {
  const title = row.title.toLowerCase();
  const instrument =
    INSTRUMENT_BY_TITLE.find((rule) => rule.test(title))?.instrument ?? "other";
  return {
    id: mintOpportunityId("goeo", row.external_id),
    source: "goeo",
    nativeId: row.external_id,
    lane: "state",
    jurisdiction: "UT",
    instrument,
    status: "standing",
    program: row.title,
    agency: { name: row.title },
    value: null,
    deadline: null,
    url: row.link,
    aln: [],
    description: row.description,
  };
}
