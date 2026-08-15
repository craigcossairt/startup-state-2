import { describe, expect, it } from "vitest";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import { retrieveOpportunities } from "./retrieve";

function federalAgencyText(
  opportunities: { source: string; agency: { name: string; code?: string } }[],
): string {
  return opportunities
    .filter((row) => row.source === "grants_gov")
    .map((row) => `${row.agency.code ?? ""} ${row.agency.name}`)
    .join(" ");
}

describe("fixture Grants.gov agency coverage", () => {
  it("keeps fixture-1 native id 359666 and includes NSF", async () => {
    const result = await retrieveOpportunities(loadCompanyFixture("fixture-1"));
    const federal = result.opportunities.filter((row) => row.source === "grants_gov");
    expect(federal.some((row) => row.nativeId === "359666")).toBe(true);
    expect(federalAgencyText(result.opportunities)).toMatch(/NSF/i);
  });

  it("drops diplomatic mission grants from fixture-1 so NIH and NSF can reach rank", async () => {
    const result = await retrieveOpportunities(loadCompanyFixture("fixture-1"));
    const federal = result.opportunities.filter((row) => row.source === "grants_gov");
    const mission = federal.filter((row) =>
      /u\.s\. mission to/i.test(`${row.agency.name} ${row.program}`),
    );
    expect(mission.map((row) => row.nativeId)).toEqual([]);
    expect(federal.some((row) => /bridge2ai|primed-ai/i.test(row.program))).toBe(
      true,
    );
    expect(federal.some((row) => /sbir|sttr/i.test(row.program))).toBe(true);
  });

  it("includes DoD or NASA on fixture-2 aerospace", async () => {
    const result = await retrieveOpportunities(loadCompanyFixture("fixture-2"));
    expect(federalAgencyText(result.opportunities)).toMatch(/DOD|NASA/i);
  });

  it("includes DoD on fixture-4 cyber", async () => {
    const result = await retrieveOpportunities(loadCompanyFixture("fixture-4"));
    expect(federalAgencyText(result.opportunities)).toMatch(/DOD/i);
  });

  it("keeps federal DoD or NASA on fixture-2 when the directory chip fills GOEO", async () => {
    const result = await retrieveOpportunities(loadCompanyFixture("fixture-2"), {
      includeDirectory: true,
    });
    expect(result.opportunities.some((row) => row.source === "grants_gov")).toBe(
      true,
    );
    expect(federalAgencyText(result.opportunities)).toMatch(/DOD|NASA/i);
  });
});
