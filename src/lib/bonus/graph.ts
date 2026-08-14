import type { RankedCard } from "@/lib/types/opportunity";

export type GraphEdge = {
  from: string;
  to: string;
  reason: "agency" | "aln";
};

export function opportunityGraph(cards: RankedCard[]): {
  nodes: string[];
  edges: GraphEdge[];
} {
  const nodes = cards.map((card) => card.opportunity.id);
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < cards.length; i += 1) {
    for (let j = i + 1; j < cards.length; j += 1) {
      const a = cards[i].opportunity;
      const b = cards[j].opportunity;
      const reason = sharedReason(a.agency.name, a.aln, b.agency.name, b.aln);
      if (!reason) continue;
      const key = `${a.id}|${b.id}|${reason}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: a.id, to: b.id, reason });
    }
  }
  return { nodes, edges };
}

function sharedReason(
  agencyA: string,
  alnA: string[],
  agencyB: string,
  alnB: string[],
): GraphEdge["reason"] | null {
  if (agencyA && agencyA === agencyB) return "agency";
  if (alnA.some((code) => alnB.includes(code))) return "aln";
  return null;
}
