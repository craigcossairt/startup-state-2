import { describe, expect, it } from "vitest";
import { graphClusters, opportunityGraph } from "./graph";
import { ranked } from "./test-cards";

describe("opportunityGraph", () => {
  it("makes nodes from ranked ids and edges when agency or aln is shared", () => {
    const graph = opportunityGraph([
      ranked({ id: "grants_gov:1", agency: "NIH", aln: ["93.310"] }),
      ranked({ id: "grants_gov:2", agency: "NIH", aln: ["93.867"] }),
      ranked({ id: "grants_gov:3", agency: "CDC", aln: ["93.310"] }),
      ranked({ id: "curated:sbdc", agency: "Utah SBDC", aln: [] }),
    ]);
    expect(graph.nodes).toEqual([
      "grants_gov:1",
      "grants_gov:2",
      "grants_gov:3",
      "curated:sbdc",
    ]);
    expect(graph.edges).toEqual([
      { from: "grants_gov:1", to: "grants_gov:2", reason: "agency" },
      { from: "grants_gov:1", to: "grants_gov:3", reason: "aln" },
    ]);
  });

  it("groups named programs so the graph is readable", () => {
    const clusters = graphClusters([
      ranked({
        id: "grants_gov:1",
        program: "NIH Seed",
        agency: "NIH",
        aln: ["93.310"],
      }),
      ranked({
        id: "grants_gov:2",
        program: "NIH SBIR",
        agency: "NIH",
        aln: ["93.867"],
      }),
      ranked({
        id: "grants_gov:3",
        program: "CDC Workforce",
        agency: "CDC",
        aln: ["93.310"],
      }),
      ranked({
        id: "curated:sbdc",
        program: "Utah SBDC advising",
        agency: "Utah SBDC",
        aln: [],
      }),
    ]);
    expect(clusters).toEqual([
      {
        reason: "agency",
        label: "NIH",
        programs: [
          { id: "grants_gov:1", program: "NIH Seed" },
          { id: "grants_gov:2", program: "NIH SBIR" },
        ],
      },
      {
        reason: "aln",
        label: "ALN 93.310",
        programs: [
          { id: "grants_gov:1", program: "NIH Seed" },
          { id: "grants_gov:3", program: "CDC Workforce" },
        ],
      },
    ]);
  });
});
