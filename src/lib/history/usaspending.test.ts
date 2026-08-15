import { describe, expect, it } from "vitest";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import { loadUsaSpendingAwards } from "./usaspending";
import type { Opportunity, RankedCard } from "@/lib/types/opportunity";

function card(id: string, aln: string[]): RankedCard {
  const opportunity: Opportunity = {
    id: `grants_gov:${id}`,
    source: "grants_gov",
    nativeId: id,
    lane: "federal",
    jurisdiction: null,
    instrument: "grant",
    status: "posted",
    program: id,
    agency: { name: "Agency" },
    value: null,
    deadline: null,
    url: null,
    aln,
    description: null,
  };
  return {
    opportunity,
    fit: "likely",
    why: "why",
    concerns: [],
    nextStep: { label: "Open" },
    similarAwardees: [],
  };
}

describe("loadUsaSpendingAwards", () => {
  it("fetches each ALN on its own and tags the award with that ALN", async () => {
    const programNumbers: string[][] = [];
    const fetchImpl: typeof fetch = async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as {
        filters: { program_numbers: string[] };
      };
      programNumbers.push(body.filters.program_numbers);
      const aln = body.filters.program_numbers[0];
      return {
        ok: true,
        json: async () => ({
          results: [
            {
              "Recipient Name": aln === "93.310" ? "Valley Clinic Systems" : "Red Rock Energy",
              "Start Date": "2023-01-01",
              "Award Amount": 1000,
            },
          ],
        }),
      } as Response;
    };

    const awards = await loadUsaSpendingAwards(
      loadCompanyFixture("fixture-1"),
      [card("1", ["93.310"]), card("2", ["81.135"])],
      fetchImpl,
    );

    expect(programNumbers).toEqual([["93.310"], ["81.135"]]);
    expect(awards).toEqual([
      {
        source: "usaspending",
        name: "Valley Clinic Systems",
        amountUsd: 1000,
        year: 2023,
        summary: undefined,
        aln: ["93.310"],
      },
      {
        source: "usaspending",
        name: "Red Rock Energy",
        amountUsd: 1000,
        year: 2023,
        summary: undefined,
        aln: ["81.135"],
      },
    ]);
  });
});
