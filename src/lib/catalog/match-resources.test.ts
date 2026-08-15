import { describe, expect, it } from "vitest";
import { applyTestCase } from "./you-persona";
import { filterRankedCards, matchResources, resourcesForPersona } from "./match-resources";
import type { CatalogResource } from "./types";
import type { RankedCard } from "@/lib/types/opportunity";

const resources: CatalogResource[] = [
  {
    id: "trade",
    externalId: "trade",
    title: "Utah Office of International Trade",
    description: "Export counseling.",
    communities: [],
    industries: [],
    locations: ["Washington"],
    topics: ["International Trade"],
    link: null,
    email: null,
  },
  {
    id: "fund",
    externalId: "fund",
    title: "Utah Microloan Fund",
    description: "Small loans for founders.",
    communities: ["Woman-owned"],
    industries: ["Software and Information Technology"],
    locations: ["Salt Lake"],
    topics: ["Funding"],
    link: null,
    email: null,
  },
  {
    id: "cedar",
    externalId: "cedar",
    title: "Cedar City BIC",
    description: "Southern counseling.",
    communities: [],
    industries: [],
    locations: ["Iron"],
    topics: ["Start a Business"],
    link: null,
    email: null,
  },
];

describe("persona resource matching", () => {
  it("ranks funding resources first for the Healthcare AI test case and hides non-overlapping counties", () => {
    const persona = applyTestCase("fixture-1");
    expect(matchResources(persona, resources)[0]?.resource.id).toBe("fund");
    expect(matchResources(persona, resources)[0]?.reasons.map((reason) => reason.label)).toEqual([
      "For find funding",
      "Software focus",
    ]);
    expect(resourcesForPersona(resources, persona).map((row) => row.id)).toEqual(["fund"]);
    const womanOwned = { ...persona, communities: ["Woman-owned" as const] };
    expect(
      matchResources(womanOwned, resources)[0]?.reasons.some((reason) => reason.kind === "community"),
    ).toBe(true);
  });
});

describe("persona map filtering", () => {
  it("keeps grant cards ahead of counseling when the goal is Find funding", () => {
    const grant = card("grants_gov:1", "grant", "Utah SBIR matching grant");
    const counsel = card("goeo:2", "counseling", "Free mentoring hour");
    expect(filterRankedCards([counsel, grant], applyTestCase("fixture-1")).map((row) => row.opportunity.id)).toEqual([
      "grants_gov:1",
    ]);
  });
});

function card(id: RankedCard["opportunity"]["id"], instrument: RankedCard["opportunity"]["instrument"], program: string): RankedCard {
  return {
    opportunity: {
      id,
      source: id.startsWith("grant") ? "grants_gov" : "goeo",
      nativeId: id,
      lane: "state",
      jurisdiction: "UT",
      instrument,
      status: "posted",
      program,
      agency: { name: "GOEO" },
      value: null,
      deadline: null,
      url: null,
      aln: [],
      description: null,
    },
    fit: "likely",
    why: program,
    concerns: [],
    nextStep: { label: "Open" },
    similarAwardees: [],
  };
}
