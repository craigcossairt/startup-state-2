import type { CatalogResource, CatalogStartup } from "./types";

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseResource(raw: unknown, index: number): CatalogResource | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const title = asString(row.title);
  if (!title) return null;
  const externalId = asString(row.external_id) ?? asString(row.externalId);
  return {
    id: externalId ?? `resource-${index + 1}`,
    externalId,
    title,
    description: asString(row.description),
    communities: asStringList(row.communities),
    industries: asStringList(row.industries),
    locations: asStringList(row.locations),
    topics: asStringList(row.topics),
    link: asString(row.link),
    email: asString(row.email),
  };
}

export function parseStartup(raw: unknown, index: number): CatalogStartup | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const name = asString(row.name);
  if (!name) return null;
  const slug = asString(row.slug) ?? `startup-${index + 1}`;
  return {
    id: asString(row.id) ?? slug,
    slug,
    name,
    website: asString(row.website),
    linkedinUrl: asString(row.linkedin_url) ?? asString(row.linkedinUrl),
    description: asString(row.description),
    fullAddress: asString(row.full_address) ?? asString(row.fullAddress),
    city: asString(row.city),
    region: asString(row.region),
    lat: asNumber(row.lat),
    lng: asNumber(row.lng),
    sector: asString(row.sector) ?? "Other",
    stage: asString(row.stage),
    employeesBucket: asString(row.employees_bucket) ?? asString(row.employeesBucket) ?? "Undisclosed",
    revenueBucket: asString(row.revenue_bucket) ?? asString(row.revenueBucket) ?? "Undisclosed",
    foundingYear: asNumber(row.founding_year) ?? asNumber(row.foundingYear),
    isHiring: row.is_hiring === true || row.isHiring === true,
    careersUrl: asString(row.careers_url) ?? asString(row.careersUrl),
  };
}

export function parseResourceList(raw: unknown): CatalogResource[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row, index) => parseResource(row, index))
    .filter((row): row is CatalogResource => row !== null);
}

export function parseStartupList(raw: unknown): CatalogStartup[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row, index) => parseStartup(row, index))
    .filter((row): row is CatalogStartup => row !== null);
}
