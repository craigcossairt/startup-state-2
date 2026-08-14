import type { RankedCard } from "@/lib/types/opportunity";

const DAY_MS = 24 * 60 * 60 * 1000;

export function twelveMonthStrategy(
  cards: RankedCard[],
  now = new Date(),
): RankedCard[] {
  const horizon = now.getTime() + 365 * DAY_MS;
  const dated: RankedCard[] = [];
  const standing: RankedCard[] = [];
  for (const card of cards) {
    const deadline = card.opportunity.deadline;
    if (deadline) {
      const time = Date.parse(deadline);
      if (Number.isFinite(time) && time >= now.getTime() && time <= horizon) {
        dated.push(card);
      }
      continue;
    }
    if (card.opportunity.status === "standing") {
      standing.push(card);
    }
  }
  dated.sort((a, b) =>
    (a.opportunity.deadline ?? "").localeCompare(b.opportunity.deadline ?? ""),
  );
  return [...dated, ...standing];
}
