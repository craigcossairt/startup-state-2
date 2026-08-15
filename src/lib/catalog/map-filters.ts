import type { CatalogStartup } from "./types";

export const ALL_SECTORS = [
  "Software",
  "FinTech",
  "BioMedical",
  "Manufacturing",
  "Agriculture",
  "Consumer",
  "Energy",
  "Security",
  "Marketplaces",
  "Other",
] as const;

export const ALL_STAGES = [
  "Idea",
  "PreSeed",
  "Seed",
  "SeriesA",
  "SeriesB",
  "SeriesC",
  "SeriesDPlus",
  "Bootstrapped",
] as const;

export const ALL_REGIONS = ["Wasatch Front", "Northern Utah", "Southern Utah", "Rural"] as const;

export const ALL_REVENUES = [
  "Pre-revenue",
  "<$1M",
  "$1M-$10M",
  "$10M-$100M",
  "$100M+",
  "Undisclosed",
] as const;

export type SectorName = (typeof ALL_SECTORS)[number];
export type StageName = (typeof ALL_STAGES)[number];
export type RegionName = (typeof ALL_REGIONS)[number];
export type RevenueName = (typeof ALL_REVENUES)[number];

export const SECTOR_COLORS: Record<SectorName, string> = {
  Software: "#00A24C",
  FinTech: "#0D9DFF",
  BioMedical: "#8E32F5",
  Manufacturing: "#FF6840",
  Agriculture: "#13DF81",
  Consumer: "#FFAD00",
  Energy: "#A3F0AE",
  Security: "#0021FF",
  Marketplaces: "#D3D4D9",
  Other: "#6B6C70",
};

export const SECTOR_LABEL: Record<SectorName, string> = {
  Software: "Software",
  FinTech: "FinTech",
  BioMedical: "Bio / Medical",
  Manufacturing: "Manufacturing",
  Agriculture: "Agriculture",
  Consumer: "Consumer",
  Energy: "Energy",
  Security: "Security",
  Marketplaces: "Marketplaces",
  Other: "Other",
};

export const STAGE_LABEL: Record<StageName, string> = {
  Idea: "Idea",
  PreSeed: "Pre-Seed",
  Seed: "Seed",
  SeriesA: "Series A",
  SeriesB: "Series B",
  SeriesC: "Series C",
  SeriesDPlus: "Series D+",
  Bootstrapped: "Bootstrapped",
};

export function sectorColor(sector: string): string {
  return SECTOR_COLORS[sector as SectorName] ?? SECTOR_COLORS.Other;
}

export function sectorLabel(sector: string): string {
  return SECTOR_LABEL[sector as SectorName] ?? sector;
}

export function stageLabel(stage: string | null): string | null {
  if (!stage) return null;
  return STAGE_LABEL[stage as StageName] ?? stage;
}

export type StartupMapFilters = {
  sectors: Set<string>;
  stages: Set<string>;
  regions: Set<string>;
  revenues: Set<string>;
  hiringOnly: boolean;
};

export function emptyStartupMapFilters(): StartupMapFilters {
  return {
    sectors: new Set(),
    stages: new Set(),
    regions: new Set(),
    revenues: new Set(),
    hiringOnly: false,
  };
}

export function paramsToFilters(params: URLSearchParams): StartupMapFilters {
  const filters = emptyStartupMapFilters();
  for (const value of params.getAll("sector")) {
    if ((ALL_SECTORS as readonly string[]).includes(value)) filters.sectors.add(value);
  }
  for (const value of params.getAll("stage")) {
    if ((ALL_STAGES as readonly string[]).includes(value)) filters.stages.add(value);
  }
  for (const value of params.getAll("region")) {
    if ((ALL_REGIONS as readonly string[]).includes(value)) filters.regions.add(value);
  }
  for (const value of params.getAll("revenue")) {
    if ((ALL_REVENUES as readonly string[]).includes(value)) filters.revenues.add(value);
  }
  filters.hiringOnly = params.get("hiring") === "true";
  return filters;
}

export function filtersToParams(
  filters: StartupMapFilters,
  previous: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams();
  const selected = previous.get("startup");
  if (selected) params.set("startup", selected);
  for (const value of filters.sectors) params.append("sector", value);
  for (const value of filters.stages) params.append("stage", value);
  for (const value of filters.regions) params.append("region", value);
  for (const value of filters.revenues) params.append("revenue", value);
  if (filters.hiringOnly) params.set("hiring", "true");
  return params;
}

export function applyStartupMapFilters(
  rows: CatalogStartup[],
  filters: StartupMapFilters,
): CatalogStartup[] {
  return rows.filter((row) => {
    if (filters.sectors.size > 0 && !filters.sectors.has(row.sector)) return false;
    if (filters.stages.size > 0 && (!row.stage || !filters.stages.has(row.stage))) return false;
    if (filters.regions.size > 0 && (!row.region || !filters.regions.has(row.region))) return false;
    if (filters.revenues.size > 0 && !filters.revenues.has(row.revenueBucket)) return false;
    if (filters.hiringOnly && !row.isHiring) return false;
    return true;
  });
}
