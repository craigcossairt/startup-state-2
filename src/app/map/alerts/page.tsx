"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BonusPage } from "@/components/bonus-page";
import { newOpportunityIds, subscribeToSearch, type SavedSearch } from "@/lib/bonus/alerts";
import { loadSavedSearch, peekCachedMap, persistSavedSearch } from "@/lib/session-map";
import { loadStoredProfile } from "@/lib/session-profile";

export default function AlertsPage() {
  const [saved, setSaved] = useState<SavedSearch | null>(null);

  useEffect(() => {
    setSaved(loadSavedSearch());
  }, []);

  return (
    <BonusPage title="Watch this search" active="/map/alerts">
      {(payload) => {
        const newIds = saved ? newOpportunityIds(saved.seenIds, payload.retrievedIds) : [];
        const newCards = payload.cards.filter((card) => newIds.includes(card.opportunity.id));

        function watchNow() {
          const profile = loadStoredProfile();
          if (!profile) return;
          const search = subscribeToSearch({
            profile,
            chips: peekCachedMap()?.chips ?? {},
            seenIds: payload.retrievedIds,
          });
          persistSavedSearch(search);
          setSaved(search);
        }

        return (
          <div className="space-y-4">
            <p className="text-foreground-muted">
              Subscribe to this company search. The next time the map runs, new
              retrieved programs are flagged here. Email delivery is not wired yet.
            </p>
            {saved ? (
              <p className="text-sm font-semibold">Watching {saved.label}</p>
            ) : (
              <button
                type="button"
                onClick={watchNow}
                className="rounded-md bg-midnight px-4 py-2 text-sm font-bold text-white"
              >
                Watch this search
              </button>
            )}
            {newCards.length === 0 ? (
              <p className="text-sm text-foreground-muted">No new programs since you subscribed.</p>
            ) : (
              <ul className="space-y-3">
                {newCards.map((card) => (
                  <li key={card.opportunity.id} className="rounded-lg border border-border p-4">
                    <p className="text-xs font-bold uppercase text-vibrant-green">New</p>
                    <p className="font-extrabold">{card.opportunity.program}</p>
                    <p className="text-sm text-foreground-muted">{card.opportunity.agency.name}</p>
                  </li>
                ))}
              </ul>
            )}
            <p>
              <Link href="/map" className="text-sm font-semibold text-vibrant-green">
                Back to ranked cards
              </Link>
            </p>
          </div>
        );
      }}
    </BonusPage>
  );
}
