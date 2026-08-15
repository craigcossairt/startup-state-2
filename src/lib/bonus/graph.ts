import type { RankedCard } from "@/lib/types/opportunity";

export type GraphCluster = {
  reason: "agency" | "aln";
  label: string;
  programs: { id: string; program: string }[];
};

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

export function graphClusters(cards: RankedCard[]): GraphCluster[] {
  const clusters: GraphCluster[] = [];
  const agencies = new Map<string, { id: string; program: string }[]>();
  const alns = new Map<string, { id: string; program: string }[]>();

  for (const card of cards) {
    const node = { id: card.opportunity.id, program: card.opportunity.program };
    const agency = card.opportunity.agency.name;
    if (agency) {
      const list = agencies.get(agency) ?? [];
      list.push(node);
      agencies.set(agency, list);
    }
    for (const code of card.opportunity.aln) {
      const list = alns.get(code) ?? [];
      list.push(node);
      alns.set(code, list);
    }
  }

  for (const [label, programs] of agencies) {
    if (programs.length < 2) continue;
    clusters.push({ reason: "agency", label, programs });
  }
  for (const [code, programs] of alns) {
    if (programs.length < 2) continue;
    clusters.push({ reason: "aln", label: `ALN ${code}`, programs });
  }
  return clusters;
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
