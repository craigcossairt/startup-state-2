import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hiringStartups } from "./filter";
import { applyCommittedHiringFlags } from "./load";
import { parseStartupList } from "./parse";
import type { CatalogStartup } from "./types";

const root = process.cwd();

/** Part 1 live /careers list on 2026-08-15. Independent of this repo's flags. */
const PART1_HIRING_SLUGS = [
  "3helix",
  "applause",
  "atomic",
  "bookclub",
  "boostly",
  "brooksee",
  "canopy-tax",
  "clientbook",
  "deeppower",
  "gabb-wireless",
  "herodevs",
  "leeway",
  "leland",
  "lucid",
  "mx",
  "nomi-health",
  "ovation",
  "pillow-cube",
  "powder-watts",
  "renew-biotechnologies",
  "sabx",
  "schoolai",
  "seis",
  "squarepeg",
  "stumbl",
  "tava-health",
  "vanilla",
  "videra-health",
  "whistic",
  "zartico",
] as const;

describe("committed hiring catalog", () => {
  it("keeps the Part 1 30-company hiring set so Careers and the home KPI are not empty", () => {
    const startups = parseStartupList(
      JSON.parse(readFileSync(path.join(root, "data/catalog/startups.json"), "utf8")),
    );
    expect(hiringStartups(startups).map((row) => row.slug).sort()).toEqual(
      [...PART1_HIRING_SLUGS].sort(),
    );
  });

  it("overlays committed hiring flags onto live rows so a stale Supabase seed cannot zero the KPI", () => {
    const committed = parseStartupList(
      JSON.parse(readFileSync(path.join(root, "data/catalog/startups.json"), "utf8")),
    );
    const live: CatalogStartup[] = committed.map((row) => ({
      ...row,
      isHiring: false,
      careersUrl: null,
    }));
    const merged = applyCommittedHiringFlags(live, committed);
    expect(hiringStartups(live)).toEqual([]);
    expect(hiringStartups(merged).map((row) => row.slug).sort()).toEqual(
      [...PART1_HIRING_SLUGS].sort(),
    );
  });

  it("syncs is_hiring onto existing Supabase rows on the production apply", () => {
    const script = readFileSync(path.join(root, "scripts/apply-catalog-schema.mjs"), "utf8");
    expect(script).toMatch(/update public\.startups\s+set is_hiring/i);
    expect(script).toContain("where slug");
  });

  it("paints the Part 1 Filter and BellPlus icons on Careers watch chrome", () => {
    const talent = readFileSync(
      path.join(root, "src/components/catalog/talent-filters.tsx"),
      "utf8",
    );
    const save = readFileSync(
      path.join(root, "src/components/catalog/save-search-button.tsx"),
      "utf8",
    );
    expect(talent).toContain("FilterIcon");
    expect(save).toContain("BellPlusIcon");
    expect(save).toContain("Email me when this changes");
  });
});
