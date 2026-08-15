import type { CatalogResource, CatalogStartup, PlaybookStep } from "./types";

export function filterResources(
  rows: CatalogResource[],
  query: { q?: string; topic?: string; community?: string },
): CatalogResource[] {
  const needle = query.q?.trim().toLowerCase() ?? "";
  const topic = query.topic?.trim() ?? "";
  const community = query.community?.trim() ?? "";
  return rows.filter((row) => {
    if (topic && !row.topics.includes(topic)) return false;
    if (community && !row.communities.includes(community)) return false;
    if (!needle) return true;
    const hay = [row.title, row.description ?? "", ...row.topics, ...row.communities]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}

export function resourceTopics(rows: CatalogResource[]): string[] {
  return [...new Set(rows.flatMap((row) => row.topics))].sort((a, b) => a.localeCompare(b));
}

export function resourceCommunities(rows: CatalogResource[]): string[] {
  return [...new Set(rows.flatMap((row) => row.communities).filter((item) => item !== "Any"))].sort(
    (a, b) => a.localeCompare(b),
  );
}

export function resourcesForStep(
  step: PlaybookStep,
  rows: CatalogResource[],
  limit = 6,
): CatalogResource[] {
  const wanted = new Set(step.resourceTopics);
  return rows.filter((row) => row.topics.some((topic) => wanted.has(topic))).slice(0, limit);
}

export function filterStartups(
  rows: CatalogStartup[],
  query: { q?: string; sector?: string; region?: string },
): CatalogStartup[] {
  const needle = query.q?.trim().toLowerCase() ?? "";
  return rows.filter((row) => {
    if (query.sector && row.sector !== query.sector) return false;
    if (query.region && row.region !== query.region) return false;
    if (!needle) return true;
    const hay = [row.name, row.city ?? "", row.description ?? "", row.sector]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}

export function mappableStartups(rows: CatalogStartup[]): CatalogStartup[] {
  return rows.filter(
    (row) => typeof row.lat === "number" && typeof row.lng === "number",
  );
}

export function hiringStartups(rows: CatalogStartup[]): CatalogStartup[] {
  return rows.filter((row) => row.isHiring || Boolean(row.careersUrl));
}

export function officialJobBoards(rows: CatalogResource[]): CatalogResource[] {
  return rows
    .filter((row) => {
      const title = row.title.toLowerCase();
      return (
        title.includes("workforce services") ||
        title.includes("talent ready") ||
        title.includes("custom fit")
      );
    })
    .slice(0, 8);
}

export function startupSectors(rows: CatalogStartup[]): string[] {
  return [...new Set(rows.map((row) => row.sector))].sort((a, b) => a.localeCompare(b));
}

export function startupRegions(rows: CatalogStartup[]): string[] {
  return [
    ...new Set(rows.map((row) => row.region).filter((value): value is string => Boolean(value))),
  ].sort((a, b) => a.localeCompare(b));
}

export function withWebsiteProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
