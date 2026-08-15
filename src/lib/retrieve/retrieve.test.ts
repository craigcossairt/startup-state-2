import { describe, expect, it } from "vitest";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import { fireGoeoKeys } from "./goeo-keys";
import {
  capRetrieved,
  retrieveOpportunities,
  FEDERAL_RESERVE,
  RETRIEVE_CAP,
} from "./retrieve";
import type { Opportunity } from "@/lib/types/opportunity";

function stub(id: string, source: Opportunity["source"] = "grants_gov"): Opportunity {
  return {
    id: `${source}:${id}` as Opportunity["id"],
    source,
    nativeId: id,
    lane: source === "grants_gov" || source === "sam_opps" ? "federal" : "state",
    jurisdiction: source === "grants_gov" || source === "sam_opps" ? null : "UT",
    instrument: "grant",
    status: "posted",
    program: id,
    agency: { name: "Test" },
    value: null,
    deadline: null,
    url: null,
    aln: [],
    description: null,
  };
}

describe("retrieveOpportunities", () => {
  it("includes curated:nucleus-grow for fixture-1 and stays at the retrieve cap", async () => {
    const result = await retrieveOpportunities(loadCompanyFixture("fixture-1"));
    expect(result.firedKeys).toContain("sbir-help");
    expect(result.retrievedIds).toContain("curated:nucleus-grow");
    expect(result.opportunities).toHaveLength(result.retrievedIds.length);
    expect(result.opportunities.length).toBeLessThanOrEqual(RETRIEVE_CAP);
    expect(result.opportunities.every((row) => row.id === `${row.source}:${row.nativeId}`)).toBe(true);
  });

  it("uses cached Grants.gov slices for fixture-1 instead of inventing federal ids", async () => {
    const result = await retrieveOpportunities(loadCompanyFixture("fixture-1"));
    const federal = result.opportunities.filter((row) => row.source === "grants_gov");
    expect(federal.length).toBeGreaterThan(0);
    expect(federal.some((row) => row.nativeId === "359666")).toBe(true);
  });

  it("retrieves workforce and counseling GOEO rows for fixture-5", async () => {
    const result = await retrieveOpportunities(loadCompanyFixture("fixture-5"));
    expect(result.firedKeys).toEqual(expect.arrayContaining(["workforce", "counseling"]));
    const programs = result.opportunities.map((row) => row.program);
    expect(programs).toContain("Utah Department of Workforce Services");
    expect(programs).toContain("Small Business Development Center (SBDC)");
  });

  it("keeps all five fixture profiles under the retrieve cap", async () => {
    for (const id of ["fixture-1", "fixture-2", "fixture-3", "fixture-4", "fixture-5"] as const) {
      const result = await retrieveOpportunities(loadCompanyFixture(id));
      expect(result.opportunities.length).toBeLessThanOrEqual(RETRIEVE_CAP);
      expect(fireGoeoKeys(loadCompanyFixture(id))).toEqual(result.firedKeys);
    }
  });
});

describe("capRetrieved", () => {
  it("reserves federal slots so leftover GOEO cannot fill the whole cap", () => {
    const curated = Array.from({ length: 7 }, (_, i) => stub(`c${i}`, "curated"));
    const goeo = Array.from({ length: 40 }, (_, i) => stub(`g${i}`, "goeo"));
    const federal = Array.from({ length: 20 }, (_, i) => stub(`f${i}`));
    const capped = capRetrieved({ curated, goeo, federal, cap: 50 });
    expect(capped).toHaveLength(50);
    expect(capped.filter((row) => row.source === "curated")).toHaveLength(7);
    expect(capped.filter((row) => row.source === "grants_gov")).toHaveLength(
      FEDERAL_RESERVE,
    );
    expect(capped.filter((row) => row.source === "goeo")).toHaveLength(28);
    expect(capped[0].source).toBe("curated");
  });

  it("honors an explicit federal reserve on a smaller cap", () => {
    const curated = [stub("nucleus-grow", "curated"), stub("sbdc", "curated")];
    const goeo = Array.from({ length: 20 }, (_, i) => stub(`g${i}`, "goeo"));
    const federal = Array.from({ length: 20 }, (_, i) => stub(`f${i}`));
    const capped = capRetrieved({
      curated,
      goeo,
      federal,
      cap: 20,
      federalReserve: 8,
    });
    expect(capped).toHaveLength(20);
    expect(capped[0].id).toBe("curated:nucleus-grow");
    expect(capped[1].id).toBe("curated:sbdc");
    expect(capped.filter((row) => row.source === "goeo")).toHaveLength(10);
    expect(capped.filter((row) => row.source === "grants_gov")).toHaveLength(8);
  });
});
