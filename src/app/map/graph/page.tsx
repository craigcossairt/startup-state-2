"use client";

import { BonusPage } from "@/components/bonus-page";
import { graphClusters } from "@/lib/bonus/graph";

export default function GraphPage() {
  return (
    <BonusPage title="How these programs connect" active="/map/graph">
      {(payload) => {
        const clusters = graphClusters(payload.cards);
        if (clusters.length === 0) {
          return (
            <p>
              No two programs on this map share an agency or an assistance listing
              number. That is expected when the ranked set is mixed.
            </p>
          );
        }
        return (
          <div className="space-y-6">
            <p className="text-foreground-muted">
              Programs grouped when they share an agency or the same ALN. This is
              not a geographic map.
            </p>
            {clusters.map((cluster) => (
              <section
                key={`${cluster.reason}:${cluster.label}`}
                className="rounded-xl border border-border bg-white p-5"
              >
                <p className="eyebrow">
                  {cluster.reason === "agency" ? "Same agency" : "Same assistance listing"}
                </p>
                <h2 className="mt-1 font-display text-xl font-extrabold">{cluster.label}</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                  {cluster.programs.map((program) => (
                    <li key={program.id}>{program.program}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        );
      }}
    </BonusPage>
  );
}
