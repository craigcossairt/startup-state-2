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

  it("includes DoD or NASA on fixture-2 aerospace", async () => {
    const result = await retrieveOpportunities(loadCompanyFixture("fixture-2"));
    expect(federalAgencyText(result.opportunities)).toMatch(/DOD|NASA/i);
  });

  it("includes DoD on fixture-4 cyber", async () => {
    const result = await retrieveOpportunities(loadCompanyFixture("fixture-4"));
    expect(federalAgencyText(result.opportunities)).toMatch(/DOD/i);
  });
});
