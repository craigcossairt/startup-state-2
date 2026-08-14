import { existsSync, readFileSync } from "node:fs";
import { dataPath } from "@/lib/paths";
import type { Opportunity } from "@/lib/types/opportunity";

type SamListing = {
  assistanceListingId?: string;
  title?: string;
  overview?: {
    objective?: string;
    assistanceListingDescription?: string;
  };
};

type SamCache = {
  assistanceListingsData?: SamListing[];
};

let index: Map<string, SamListing> | null = null;

function ingestSamFile(file: string, into: Map<string, SamListing>) {
  if (!existsSync(file)) return;
  const parsed = JSON.parse(readFileSync(file, "utf8")) as SamCache;
  for (const listing of parsed.assistanceListingsData ?? []) {
    if (listing.assistanceListingId && !into.has(listing.assistanceListingId)) {
      into.set(listing.assistanceListingId, listing);
    }
  }
}

function loadSamIndex(): Map<string, SamListing> {
  if (index) return index;
  index = new Map();
  ingestSamFile(dataPath("cache", "sam", "listings-slice.json"), index);
  ingestSamFile(dataPath("cache", "sam", "active.json"), index);
  return index;
}

export function joinSamListings(opportunities: Opportunity[]): Opportunity[] {
  const sam = loadSamIndex();
  if (sam.size === 0) return opportunities;
  return opportunities.map((opportunity) => {
    if (opportunity.source !== "grants_gov" || opportunity.aln.length === 0) {
      return opportunity;
    }
    const match = opportunity.aln.map((aln) => sam.get(aln)).find(Boolean);
    if (!match) return opportunity;
    const description =
      opportunity.description ||
      match.overview?.assistanceListingDescription ||
      match.overview?.objective ||
      null;
    return { ...opportunity, description };
  });
}
