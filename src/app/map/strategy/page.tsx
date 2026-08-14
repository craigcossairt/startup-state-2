"use client";

import { BonusPage } from "@/components/bonus-page";
import { twelveMonthStrategy } from "@/lib/bonus/strategy";
import { NOT_PUBLISHED } from "@/lib/copy";

export default function StrategyPage() {
  return (
    <BonusPage title="12-month strategy" active="/map/strategy">
      {(payload) => {
        const items = twelveMonthStrategy(payload.cards);
        if (items.length === 0) {
          return <p>No dated or standing cards on this map fall in the next 12 months.</p>;
        }
        return (
          <ol className="space-y-3">
            {items.map((card, index) => (
              <li key={card.opportunity.id} className="rounded-lg border border-border p-4">
                <p className="text-xs font-bold uppercase text-foreground-muted">
                  {index + 1}. {card.opportunity.deadline ?? "Standing"}
                </p>
                <p className="mt-1 font-extrabold">{card.opportunity.program}</p>
                <p className="text-sm text-foreground-muted">
                  {card.opportunity.agency.name} · {card.opportunity.deadline ?? NOT_PUBLISHED}
                </p>
              </li>
            ))}
          </ol>
        );
      }}
    </BonusPage>
  );
}
