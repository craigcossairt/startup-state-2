import { existsSync, readFileSync } from "node:fs";
import { dataPath } from "@/lib/paths";
import type { CompanyProfile, FixtureId } from "@/lib/types/company-profile";
import type { Opportunity } from "@/lib/types/opportunity";
import { mintOpportunityId } from "./ids";
import { buildGrantsGovKeyword } from "./keyword";

type GrantsGovHit = {
  id: string;
  number?: string;
  title: string;
  agencyCode?: string;
  agency?: string;
  agencyName?: string;
  closeDate?: string;
  oppStatus?: string;
  cfdaList?: string[];
  alnist?: string[];
};

type GrantsGovSearchResponse = {
  data?: { oppHits?: GrantsGovHit[] };
};

const SEARCH2_URL = "https://api.grants.gov/v1/api/search2";
const SMALL_BUSINESS_ELIGIBILITY = "23";

export function parseUsDate(value: string | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function mapGrantsGovHit(hit: GrantsGovHit): Opportunity {
  const nativeId = String(hit.id);
  return {
    id: mintOpportunityId("grants_gov", nativeId),
    source: "grants_gov",
    nativeId,
    opportunityNumber: hit.number,
    lane: "federal",
    jurisdiction: null,
    instrument: "grant",
    status: hit.oppStatus === "forecasted" ? "forecasted" : "posted",
    program: hit.title,
    agency: {
      name: hit.agency || hit.agencyName || "Federal agency",
      code: hit.agencyCode,
    },
    value: null,
    deadline: parseUsDate(hit.closeDate),
    url: `https://www.grants.gov/search-results-detail/${nativeId}`,
    aln: hit.cfdaList ?? hit.alnist ?? [],
    description: null,
  };
}

export function loadFixtureGrantsGovCache(fixtureId: FixtureId): Opportunity[] {
  const files = [
    dataPath("cache", "grants-gov", `${fixtureId}-open.json`),
    dataPath("cache", "grants-gov", `${fixtureId}-sbir.json`),
  ];
  const seen = new Set<string>();
  const out: Opportunity[] = [];
  for (const file of files) {
    if (!existsSync(file)) continue;
    const parsed = JSON.parse(readFileSync(file, "utf8")) as GrantsGovSearchResponse;
    for (const hit of parsed.data?.oppHits ?? []) {
      const opportunity = mapGrantsGovHit(hit);
      if (seen.has(opportunity.id)) continue;
      seen.add(opportunity.id);
      out.push(opportunity);
    }
  }
  return out;
}

export async function searchGrantsGovLive(
  keyword: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Opportunity[]> {
  const bodies = [
    { keyword, rows: 25, oppStatuses: "forecasted|posted", eligibilities: SMALL_BUSINESS_ELIGIBILITY },
    {
      keyword: `SBIR ${keyword}`.slice(0, 200).trim(),
      rows: 25,
      oppStatuses: "forecasted|posted",
      eligibilities: SMALL_BUSINESS_ELIGIBILITY,
    },
  ];
  const seen = new Set<string>();
  const out: Opportunity[] = [];
  for (const body of bodies) {
    const hits = await search2WithBackoff(body, fetchImpl);
    for (const hit of hits) {
      const opportunity = mapGrantsGovHit(hit);
      if (seen.has(opportunity.id)) continue;
      seen.add(opportunity.id);
      out.push(opportunity);
    }
  }
  return out;
}

async function search2WithBackoff(
  body: Record<string, unknown>,
  fetchImpl: typeof fetch,
): Promise<GrantsGovHit[]> {
  let delayMs = 1000;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetchImpl(SEARCH2_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const parsed = (await response.json()) as GrantsGovSearchResponse;
      return parsed.data?.oppHits ?? [];
    }
    if (response.status !== 429 && response.status < 500) {
      throw new Error(`Grants.gov search2 failed: ${response.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    delayMs *= 2;
  }
  return [];
}

export async function retrieveGrantsGov(
  profile: CompanyProfile,
  options: { live?: boolean; fetchImpl?: typeof fetch } = {},
): Promise<Opportunity[]> {
  if (profile.fixtureId) {
    const cached = loadFixtureGrantsGovCache(profile.fixtureId);
    if (cached.length > 0) return cached;
  }
  if (options.live === false) return [];
  const keyword = buildGrantsGovKeyword(profile);
  if (!keyword) return [];
  try {
    return await searchGrantsGovLive(keyword, options.fetchImpl);
  } catch {
    return [];
  }
}
