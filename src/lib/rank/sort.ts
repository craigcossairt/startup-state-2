import type { FitLabel, Instrument, RankedCard } from "@/lib/types/opportunity";

const FIT_RANK: Record<FitLabel, number> = {
  likely: 0,
  "potential-verify": 1,
  adjacent: 2,
  probably_not: 3,
};

const INSTRUMENT_EASE: Record<Instrument, number> = {
  counseling: 1,
  contracting_help: 1,
  incentive: 2,
  loan: 3,
  grant: 4,
  procurement: 5,
  other: 6,
};

export function sortRankedCards(cards: RankedCard[]): RankedCard[] {
  return [...cards].sort((a, b) => {
    const fit = FIT_RANK[a.fit] - FIT_RANK[b.fit];
    if (fit !== 0) return fit;

    const aDeadline = a.opportunity.deadline;
    const bDeadline = b.opportunity.deadline;
    if (aDeadline && bDeadline && aDeadline !== bDeadline) {
      return aDeadline < bDeadline ? -1 : 1;
    }
    if (aDeadline && !bDeadline) return -1;
    if (!aDeadline && bDeadline) return 1;

    const ease =
      INSTRUMENT_EASE[a.opportunity.instrument] -
      INSTRUMENT_EASE[b.opportunity.instrument];
    if (ease !== 0) return ease;

    const aMax = a.opportunity.value?.maxUsd;
    const bMax = b.opportunity.value?.maxUsd;
    if (aMax != null && bMax != null && aMax !== bMax) return bMax - aMax;
    if (aMax != null && bMax == null) return -1;
    if (aMax == null && bMax != null) return 1;

    return a.opportunity.id.localeCompare(b.opportunity.id);
  });
}
