import type { CompanyProfile } from "@/lib/types/company-profile";
import type { Opportunity, RankModelCard } from "@/lib/types/opportunity";
import { callGrokJson } from "./client";
import { RANK_SYSTEM, rankUserPrompt } from "./prompts";

const FITS = new Set(["likely", "potential-verify", "adjacent", "probably_not"]);

export function toRankInput(opportunities: Opportunity[]) {
  return opportunities.map((row) => ({
    id: row.id,
    program: row.program,
    agency: row.agency,
    lane: row.lane,
    instrument: row.instrument,
    value: row.value,
    deadline: row.deadline,
    url: row.url,
    description: row.description,
    applicantNote: row.applicantNote,
  }));
}

export function parseRankCards(payload: unknown): RankModelCard[] {
  const cards = (payload as { cards?: unknown }).cards;
  if (!Array.isArray(cards)) return [];
  return cards.flatMap((raw) => {
    const card = raw as Partial<RankModelCard>;
    if (!card.id || !card.fit || !FITS.has(card.fit) || !card.why) return [];
    return [
      {
        id: card.id,
        fit: card.fit,
        why: card.why,
        concerns: Array.isArray(card.concerns) ? card.concerns.map(String) : [],
        nextStep: {
          label: card.nextStep?.label || "Open the listing",
          url: card.nextStep?.url,
        },
      },
    ];
  });
}

export async function rankRetrievedOpportunities(
  profile: CompanyProfile,
  opportunities: Opportunity[],
): Promise<RankModelCard[]> {
  const payload = await callGrokJson({
    system: RANK_SYSTEM,
    user: rankUserPrompt(
      JSON.stringify(profile, null, 2),
      JSON.stringify(toRankInput(opportunities), null, 2),
    ),
    reasoningEffort: "medium",
  });
  return parseRankCards(payload);
}
