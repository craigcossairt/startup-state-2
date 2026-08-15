import { twelveMonthStrategy } from "./strategy";
import type { RankedCard } from "@/lib/types/opportunity";

const DAY_MS = 24 * 60 * 60 * 1000;

export type PlanItem = {
  id: string;
  label: string;
  program: string;
  url?: string;
  when: string | null;
};

export type PlanWeek = {
  title: string;
  items: PlanItem[];
};

export function fundingPlan(cards: RankedCard[], now = new Date()): PlanWeek[] {
  const horizon = now.getTime();
  const thisMonth: PlanItem[] = [];
  const next90: PlanItem[] = [];
  const standing: PlanItem[] = [];

  for (const card of twelveMonthStrategy(cards, now)) {
    const item = planItem(card);
    const deadline = card.opportunity.deadline;
    if (deadline) {
      const time = Date.parse(deadline);
      const days = (time - horizon) / DAY_MS;
      if (days <= 31) thisMonth.push(item);
      else if (days <= 90) next90.push(item);
      continue;
    }
    standing.push(item);
  }

  const weeks: PlanWeek[] = [];
  if (thisMonth.length > 0) weeks.push({ title: "This month", items: thisMonth });
  if (next90.length > 0) weeks.push({ title: "Next 90 days", items: next90 });
  if (standing.length > 0) weeks.push({ title: "Standing Utah help", items: standing });
  return weeks;
}

function planItem(card: RankedCard): PlanItem {
  return {
    id: card.opportunity.id,
    label: card.nextStep.label,
    program: card.opportunity.program,
    url: card.nextStep.url ?? card.opportunity.url ?? undefined,
    when: card.opportunity.deadline,
  };
}
