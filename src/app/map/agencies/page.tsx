"use client";

import { BonusPage } from "@/components/bonus-page";
import { groupByAgency } from "@/lib/bonus/agency-map";

export default function AgenciesPage() {
  return (
    <BonusPage title="Agencies" active="/map/agencies">
      {(payload) => (
        <div className="space-y-4">
          {groupByAgency(payload.cards).map((group) => (
            <section key={group.agency} className="rounded-lg border border-border p-4">
              <h2 className="font-extrabold">{group.agency}</h2>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {group.cards.map((card) => (
                  <li key={card.opportunity.id}>{card.opportunity.program}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </BonusPage>
  );
}
