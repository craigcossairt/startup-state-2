"use client";

import { BonusPage } from "@/components/bonus-page";
import { opportunityGraph } from "@/lib/bonus/graph";

export default function GraphPage() {
  return (
    <BonusPage title="Opportunity graph" active="/map/graph">
      {(payload) => {
        const graph = opportunityGraph(payload.cards);
        return (
          <div className="space-y-6">
            <section>
              <h2 className="font-extrabold">Nodes</h2>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {graph.nodes.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-extrabold">Edges</h2>
              {graph.edges.length === 0 ? (
                <p className="mt-2 text-sm">No shared agency or ALN on this map.</p>
              ) : (
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {graph.edges.map((edge) => (
                    <li key={`${edge.from}|${edge.to}|${edge.reason}`}>
                      {edge.from} — {edge.to} ({edge.reason})
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        );
      }}
    </BonusPage>
  );
}
