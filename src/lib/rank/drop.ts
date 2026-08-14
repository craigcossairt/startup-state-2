import type { RankModelCard } from "@/lib/types/opportunity";

export function dropUnknownRankIds(
  rankCards: RankModelCard[],
  retrievedIds: Iterable<string>,
): RankModelCard[] {
  const allowed = new Set(retrievedIds);
  return rankCards.filter((card) => allowed.has(card.id));
}
