import { attachHistory } from "@/lib/history/attach";
import { loadSbirAwards } from "@/lib/history/sbir";
import { loadUsaSpendingAwards } from "@/lib/history/usaspending";
import { rankRetrievedOpportunities } from "@/lib/grok/rank";
import { assembleRankedCards } from "@/lib/rank/assemble";
import { allMustHavesKnown } from "@/lib/profile/must-haves";
import { retrieveOpportunities } from "@/lib/retrieve/retrieve";
import type { CompanyProfile } from "@/lib/types/company-profile";
import type {
  OpportunityMapPayload,
  RetrieveChips,
} from "@/lib/types/opportunity";

export async function runRetrieveThenRank(
  profile: CompanyProfile,
  chips: RetrieveChips = {},
): Promise<OpportunityMapPayload> {
  if (!allMustHavesKnown(profile)) {
    throw new Error("Opportunity Map does not run until all must-haves are known");
  }
  const retrieved = await retrieveOpportunities(profile, chips);
  const rankCards = await rankRetrievedOpportunities(
    profile,
    retrieved.opportunities,
  );
  const assembled = assembleRankedCards(retrieved.opportunities, rankCards);
  const history = await Promise.race([
    Promise.all([
      loadSbirAwards(profile),
      loadUsaSpendingAwards(profile, assembled.cards),
    ]).then(([sbirAwards, usaAwards]) => ({ sbirAwards, usaAwards })),
    new Promise<{ sbirAwards: []; usaAwards: [] }>((resolve) =>
      setTimeout(() => resolve({ sbirAwards: [], usaAwards: [] }), 8000),
    ),
  ]);
  return {
    ...assembled,
    cards: attachHistory(assembled.cards, profile, history),
    firedKeys: retrieved.firedKeys,
    retrievedIds: retrieved.retrievedIds,
  };
}
