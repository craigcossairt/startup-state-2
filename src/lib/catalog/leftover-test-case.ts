import { FIXTURE_CHIPS } from "@/lib/copy";
import type { CompanyProfile, FixtureId } from "@/lib/types/company-profile";
import type { CatalogResource } from "./types";

export const LEFTOVER_FIXTURE_STORAGE_KEY = "leftover-fixture";

export function parseLeftoverFixtureId(value: string | null | undefined): FixtureId | null {
  if (!value) return null;
  return FIXTURE_CHIPS.some((chip) => chip.id === value) ? (value as FixtureId) : null;
}

export function leftoverFixtureHref(pathname: string, id: FixtureId): string {
  return `${pathname}?fixture=${id}`;
}

export function withLeftoverFixture(href: string, fixture: FixtureId | null): string {
  if (!fixture) return href;
  return `${href}${href.includes("?") ? "&" : "?"}fixture=${fixture}`;
}

export function leftoverFixtureNeedles(profile: CompanyProfile): string[] {
  const words = new Set<string>();
  for (const sector of profile.sectors.value ?? []) words.add(sector.toLowerCase());
  for (const tech of profile.technologies.value ?? []) {
    for (const part of tech.toLowerCase().split(/\W+/)) {
      if (part.length > 2) words.add(part);
    }
  }
  return [...words];
}

export function rankResourcesForNeedles(
  rows: CatalogResource[],
  needles: string[],
): CatalogResource[] {
  if (needles.length === 0) return rows;
  const keys = needles.map((needle) => needle.toLowerCase());
  return [...rows].sort((left, right) => {
    const delta = resourceNeedleScore(right, keys) - resourceNeedleScore(left, keys);
    return delta !== 0 ? delta : left.title.localeCompare(right.title);
  });
}

function resourceNeedleScore(row: CatalogResource, keys: string[]): number {
  const hay = [row.title, row.description ?? "", ...row.topics, ...row.industries]
    .join(" ")
    .toLowerCase();
  return keys.reduce((score, key) => score + (hay.includes(key) ? 1 : 0), 0);
}
