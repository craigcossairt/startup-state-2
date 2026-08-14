import { describe, expect, it } from "vitest";
import { sortRankedCards } from "./sort";
import type { Instrument, Opportunity, RankedCard } from "@/lib/types/opportunity";

function ranked(partial: {
  id: string;
  fit: RankedCard["fit"];
  deadline?: string | null;
  instrument?: Instrument;
  maxUsd?: number | null;
}): RankedCard {
  const opportunity: Opportunity = {
    id: partial.id as Opportunity["id"],
    source: partial.id.startsWith("curated") ? "curated" : "grants_gov",
    nativeId: partial.id.split(":")[1] ?? partial.id,
    lane: partial.id.startsWith("grants_gov") ? "federal" : "state",
    jurisdiction: partial.id.startsWith("grants_gov") ? null : "UT",
    instrument: partial.instrument ?? "grant",
    status: "posted",
    program: partial.id,
    agency: { name: "Agency" },
    value:
      partial.maxUsd == null ? null : { minUsd: 0, maxUsd: partial.maxUsd },
    deadline: partial.deadline ?? null,
    url: null,
    aln: [],
    description: null,
  };
  return {
    opportunity,
    fit: partial.fit,
    why: "why",
    concerns: [],
    nextStep: { label: "Open" },
    similarAwardees: [],
  };
}

describe("sortRankedCards", () => {
  it("sorts best Fit first, then sooner deadline, instrument ease, published maxUsd, then id", () => {
    const sorted = sortRankedCards([
      ranked({ id: "grants_gov:b", fit: "likely", deadline: "2026-12-01", instrument: "grant" }),
      ranked({ id: "grants_gov:a", fit: "likely", deadline: "2026-12-01", instrument: "grant" }),
      ranked({ id: "curated:nucleus-grow", fit: "likely", deadline: null, instrument: "counseling" }),
      ranked({ id: "grants_gov:late", fit: "likely", deadline: "2027-01-01", instrument: "grant" }),
      ranked({ id: "grants_gov:big", fit: "adjacent", maxUsd: 500000 }),
      ranked({ id: "grants_gov:small", fit: "adjacent", maxUsd: 10000 }),
      ranked({ id: "grants_gov:none", fit: "adjacent", maxUsd: null }),
      ranked({ id: "grants_gov:no", fit: "probably_not" }),
      ranked({ id: "curated:utif", fit: "potential-verify", instrument: "grant" }),
    ]);

    expect(sorted.map((card) => card.opportunity.id)).toEqual([
      "grants_gov:a",
      "grants_gov:b",
      "grants_gov:late",
      "curated:nucleus-grow",
      "curated:utif",
      "grants_gov:big",
      "grants_gov:small",
      "grants_gov:none",
      "grants_gov:no",
    ]);
  });

  it("does not use lane as a sort key", () => {
    const sorted = sortRankedCards([
      ranked({ id: "curated:sbdc", fit: "adjacent", instrument: "counseling" }),
      ranked({ id: "grants_gov:nih", fit: "likely", instrument: "grant" }),
    ]);
    expect(sorted[0].opportunity.id).toBe("grants_gov:nih");
  });
});
