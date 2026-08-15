import type { FitLabel, RankedCard } from "@/lib/types/opportunity";

/** Cards with streamed fit content only. Ranking placeholders stay out of the list. */
export function cardsReadyToPaint(
  cards: RankedCard[],
  fits: Record<FitLabel, boolean>,
): RankedCard[] {
  return cards.filter((card) => !card.ranking && fits[card.fit]);
}
