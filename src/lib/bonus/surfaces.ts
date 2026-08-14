import { applicationChecklist } from "./checklist";
import { twelveMonthStrategy } from "./strategy";
import { similarCompaniesFromCards } from "./similar-companies";
import { alertWatchesFromCards } from "./alerts";
import { groupByAgency } from "./agency-map";
import { opportunityGraph } from "./graph";
import type { RankedCard } from "@/lib/types/opportunity";

export function bonusSurfaces(cards: RankedCard[], now = new Date()) {
  const strategy = twelveMonthStrategy(cards, now);
  const agencies = groupByAgency(cards);
  const graph = opportunityGraph(cards);
  return {
    checklist: applicationChecklist(cards),
    strategyIds: strategy.map((card) => card.opportunity.id),
    similarCompanies: similarCompaniesFromCards(cards).map((row) => row.name),
    alertWatches: alertWatchesFromCards(cards),
    agencies: agencies.map((group) => ({
      agency: group.agency,
      ids: group.cards.map((card) => card.opportunity.id),
    })),
    graph,
  };
}
