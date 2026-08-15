import { describe, expect, it } from "vitest";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import { loadUsaSpendingAwards } from "./usaspending";
import type { Opportunity, RankedCard } from "@/lib/types/opportunity";

function card(id: string, aln: string[]): RankedCard {
  const opportunity: Opportunity = {
    id: `grants_gov:${id}` as Opportunity["id"],
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
  it("fetches each unique ALN and tags awards with that ALN", async () => {
    const requested: string[][] = [];
    const fetchImpl: typeof fetch = async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as {
        filters: { program_numbers: string[] };
      };
      requested.push(body.filters.program_numbers);
      const aln = body.filters.program_numbers[0];
      return {
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            {
              "Recipient Name":
                aln === "93.310" ? "Valley Clinic Systems" : "Red Rock Energy",
              "Award Amount": 1000,
              "Start Date": "2023-01-01",
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

    expect(requested).toEqual([["93.310"], ["81.135"]]);
    expect(awards.map((row) => ({ name: row.name, aln: row.aln }))).toEqual([
      { name: "Valley Clinic Systems", aln: ["93.310"] },
      { name: "Red Rock Energy", aln: ["81.135"] },
    ]);
  });
});
