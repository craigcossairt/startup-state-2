import type { CompanyProfile } from "@/lib/types/company-profile";
import type { GoeoKey, Opportunity, RetrieveChips } from "@/lib/types/opportunity";
import { loadCuratedUtahCards } from "./curated";
import { fireGoeoKeys } from "./goeo-keys";
import {
  goeoRowsForKeys,
  leftoverGoeoRows,
  mapGoeoRowToOpportunity,
} from "./goeo-rows";
import { retrieveGrantsGov } from "./grants-gov";
import { joinSamListings } from "./sam-join";
import { retrieveSamOpps } from "./sam-opps";

export const RETRIEVE_CAP = 50;

export type RetrieveResult = {
  opportunities: Opportunity[];
  firedKeys: GoeoKey[];
  retrievedIds: string[];
};

export async function retrieveOpportunities(
  profile: CompanyProfile,
  chips: RetrieveChips = {},
): Promise<RetrieveResult> {
  const firedKeys = fireGoeoKeys(profile);
  const goeoKeys = uniqueKeys([
    ...(chips.lane === "federal" ? [] : firedKeys),
    ...(chips.lane === "federal" ? [] : chips.extraGoeoKeys ?? []),
  ]);

  const curated =
    chips.lane === "federal" ? [] : loadCuratedUtahCards();
  const goeo =
    chips.lane === "federal"
      ? []
      : goeoRowsForKeys(goeoKeys).map(mapGoeoRowToOpportunity);

  if (chips.includeDirectory && chips.lane !== "federal") {
    const already = new Set([
      ...curated.map((row) => row.id),
      ...goeo.map((row) => row.id),
    ]);
    goeo.push(...leftoverGoeoRows(already).map(mapGoeoRowToOpportunity));
  }

  const grants =
    chips.lane === "state" ? [] : await retrieveGrantsGov(profile);
  const samOpps =
    chips.lane === "state" ? [] : await retrieveSamOpps(profile);
  const federal = [...grants, ...samOpps];

  const selected = capRetrieved({
    curated,
    goeo,
    federal,
    cap: RETRIEVE_CAP,
  });

  const opportunities = joinSamListings(selected);
  return {
    opportunities,
    firedKeys,
    retrievedIds: opportunities.map((row) => row.id),
  };
}

export function capRetrieved(input: {
  curated: Opportunity[];
  goeo: Opportunity[];
  federal: Opportunity[];
  cap?: number;
}): Opportunity[] {
  const cap = input.cap ?? RETRIEVE_CAP;
  const seen = new Set<string>();
  const out: Opportunity[] = [];
  for (const row of [...input.curated, ...input.goeo, ...input.federal]) {
    if (seen.has(row.id)) continue;
    if (out.length >= cap) break;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

function uniqueKeys(keys: GoeoKey[]): GoeoKey[] {
  return [...new Set(keys)];
}
