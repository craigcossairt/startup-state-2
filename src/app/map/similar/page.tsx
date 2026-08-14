"use client";

import { BonusPage } from "@/components/bonus-page";
import { similarCompaniesFromCards } from "@/lib/bonus/similar-companies";

export default function SimilarPage() {
  return (
    <BonusPage title="Similar companies" active="/map/similar">
      {(payload) => {
        const rows = similarCompaniesFromCards(payload.cards);
        if (rows.length === 0) {
          return <p>None attached. This list only shows names already on the cards.</p>;
        }
        return (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={`${row.source}:${row.name}:${row.year ?? ""}`} className="rounded-lg border border-border p-4">
                <p className="font-extrabold">{row.name}</p>
                <p className="text-sm text-foreground-muted">
                  {[row.state, row.year, row.source].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        );
      }}
    </BonusPage>
  );
}
