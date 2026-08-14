import type { RankedCard } from "@/lib/types/opportunity";

export type ChecklistItem = {
  id: string;
  label: string;
  url?: string;
};

export function applicationChecklist(cards: RankedCard[]): ChecklistItem[] {
  return cards.flatMap((card) => {
    const label = card.nextStep.label.trim();
    if (!label) return [];
    return [
      {
        id: card.opportunity.id,
        label,
        url: card.nextStep.url ?? card.opportunity.url ?? undefined,
      },
    ];
  });
}
