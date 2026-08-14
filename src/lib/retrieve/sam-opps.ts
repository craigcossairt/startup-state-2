import type { CompanyProfile } from "@/lib/types/company-profile";
import type { Opportunity } from "@/lib/types/opportunity";
import { buildGrantsGovKeyword } from "./keyword";
import { mintOpportunityId } from "./ids";

export type SamOppNotice = {
  noticeId?: string;
  title?: string;
  fullParentPathName?: string;
  department?: string;
  responseDeadLine?: string;
  uiLink?: string;
  typeOfSetAsideDescription?: string;
  naicsCode?: string;
};

export function mapSamOppNotice(notice: SamOppNotice): Opportunity | null {
  const nativeId = notice.noticeId?.trim();
  if (!nativeId || !notice.title) return null;
  return {
    id: mintOpportunityId("sam_opps", nativeId),
    source: "sam_opps",
    nativeId,
    lane: "federal",
    jurisdiction: null,
    instrument: "procurement",
    status: "posted",
    program: notice.title,
    agency: {
      name: notice.fullParentPathName || notice.department || "Federal agency",
    },
    value: null,
    deadline: parseSamDeadline(notice.responseDeadLine),
    url: notice.uiLink ?? `https://sam.gov/opp/${nativeId}/view`,
    aln: [],
    description: notice.typeOfSetAsideDescription ?? null,
    applicantNote: notice.naicsCode ? `NAICS ${notice.naicsCode}` : undefined,
  };
}

function parseSamDeadline(value: string | undefined): string | null {
  if (!value) return null;
  const iso = Date.parse(value);
  if (Number.isFinite(iso)) return new Date(iso).toISOString().slice(0, 10);
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(value.trim());
  if (!match) return null;
  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function mmddyyyy(date: Date): string {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${month}/${day}/${date.getUTCFullYear()}`;
}

export async function retrieveSamOpps(
  profile: CompanyProfile,
  options: { fetchImpl?: typeof fetch; apiKey?: string } = {},
): Promise<Opportunity[]> {
  const apiKey = options.apiKey ?? process.env.SAM_API_KEY;
  if (!apiKey) return [];
  if (process.env.VITEST && !options.fetchImpl) return [];
  const keyword = buildGrantsGovKeyword(profile);
  const now = new Date();
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const url = new URL("https://api.sam.gov/opportunities/v2/search");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("limit", "10");
  url.searchParams.set("postedFrom", mmddyyyy(from));
  url.searchParams.set("postedTo", mmddyyyy(now));
  if (keyword) url.searchParams.set("title", keyword.slice(0, 80));
  try {
    const response = await (options.fetchImpl ?? fetch)(url);
    if (!response.ok) return [];
    const payload = (await response.json()) as { opportunitiesData?: SamOppNotice[] };
    return (payload.opportunitiesData ?? [])
      .map(mapSamOppNotice)
      .filter((row): row is Opportunity => row !== null);
  } catch {
    return [];
  }
}
