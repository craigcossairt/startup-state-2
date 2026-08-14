"use client";

import { useEffect, useState } from "react";
import { BonusPage } from "@/components/bonus-page";
import { toggleAlertWatch, type AlertWatch } from "@/lib/bonus/alerts";
import { NOT_PUBLISHED } from "@/lib/copy";
import { loadAlertWatches, saveAlertWatches } from "@/lib/session-map";

export default function AlertsPage() {
  const [watches, setWatches] = useState<AlertWatch[]>([]);

  useEffect(() => {
    setWatches(loadAlertWatches());
  }, []);

  function toggle(watch: AlertWatch) {
    const next = toggleAlertWatch(watches, watch);
    setWatches(next);
    saveAlertWatches(next);
  }

  return (
    <BonusPage title="Alerts" active="/map/alerts">
      {(payload) => (
        <ul className="space-y-3">
          {payload.cards.map((card) => {
            const watch = {
              id: card.opportunity.id,
              deadline: card.opportunity.deadline,
            };
            const watching = watches.some((item) => item.id === watch.id);
            return (
              <li key={card.opportunity.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-4">
                <div>
                  <p className="font-extrabold">{card.opportunity.program}</p>
                  <p className="text-sm text-foreground-muted">
                    Deadline {card.opportunity.deadline ?? NOT_PUBLISHED}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(watch)}
                  className="rounded-md bg-midnight px-3 py-2 text-sm font-bold text-white"
                >
                  {watching ? "Stop watching" : "Watch"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </BonusPage>
  );
}
