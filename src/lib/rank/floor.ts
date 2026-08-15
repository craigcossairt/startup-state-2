import { FLOOR_BANNER } from "@/lib/copy";
import type { RankedCard } from "@/lib/types/opportunity";

const STRONG_FITS = new Set(["likely", "potential-verify", "adjacent"]);

export function tripProbablyNotFloor(cards: RankedCard[]): boolean {
  const federal = cards.filter((card) => card.opportunity.lane === "federal");
  const utah = cards.filter((card) => card.opportunity.lane === "state");
  const federalHasStrong = federal.some(
    (card) => card.fit === "likely" || card.fit === "potential-verify",
  );
  const utahHasFit = utah.some((card) => STRONG_FITS.has(card.fit));
  return !federalHasStrong && utahHasFit;
}

export function applyProbablyNotFloor(cards: RankedCard[]): {
  cards: RankedCard[];
  floorTripped: boolean;
  floorBanner: string | null;
} {
  const floorTripped = tripProbablyNotFloor(cards);
  if (!floorTripped) {
    return { cards, floorTripped: false, floorBanner: null };
  }
  const utah = cards.filter((card) => card.opportunity.lane === "state");
  const federalAdjacent = cards.filter(
    (card) => card.opportunity.lane === "federal" && card.fit === "adjacent",
  );
  const federalProbablyNot = cards
    .filter(
      (card) =>
        card.opportunity.lane === "federal" && card.fit === "probably_not",
    )
    .slice(0, 3);
  return {
    cards: [...utah, ...federalAdjacent, ...federalProbablyNot],
    floorTripped: true,
    floorBanner: FLOOR_BANNER,
  };
}
