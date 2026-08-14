import type {
  Opportunity,
  OpportunityMapPayload,
  RankModelCard,
  RankedCard,
} from "@/lib/types/opportunity";
import { dropUnknownRankIds } from "./drop";
import { applyProbablyNotFloor } from "./floor";
import { sortRankedCards } from "./sort";

export function assembleRankedCards(
  retrieved: Opportunity[],
  rankCards: RankModelCard[],
): OpportunityMapPayload {
  const byId = new Map(retrieved.map((row) => [row.id, row]));
  const legal = dropUnknownRankIds(
    rankCards,
    retrieved.map((row) => row.id),
  );
  const assembled: RankedCard[] = legal.flatMap((card) => {
    const opportunity = byId.get(card.id);
    if (!opportunity) return [];
    return [
      {
        opportunity,
        fit: card.fit,
        why: card.why,
        concerns: card.concerns,
        nextStep: {
          label: card.nextStep.label,
          url: card.nextStep.url ?? opportunity.url ?? undefined,
        },
        similarAwardees: [],
      },
    ];
  });
  const floored = applyProbablyNotFloor(sortRankedCards(assembled));
  return {
    cards: floored.cards,
    floorTripped: floored.floorTripped,
    floorBanner: floored.floorBanner,
    retrievedIds: retrieved.map((row) => row.id),
    firedKeys: [],
  };
}
