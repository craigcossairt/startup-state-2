import type { RankedCard } from "@/lib/types/opportunity";

export type AgencyGroup = {
  agency: string;
  cards: RankedCard[];
};

export function groupByAgency(cards: RankedCard[]): AgencyGroup[] {
  const groups = new Map<string, RankedCard[]>();
  for (const card of cards) {
    const name = card.opportunity.agency.name;
    const list = groups.get(name) ?? [];
    list.push(card);
    groups.set(name, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([agency, groupCards]) => ({ agency, cards: groupCards }));
}
