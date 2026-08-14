import { describe, expect, it } from "vitest";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import { attachHistory } from "./attach";
import type { Opportunity, RankedCard } from "@/lib/types/opportunity";

function card(program: string): RankedCard {
  const opportunity: Opportunity = {
    id: "grants_gov:1",
    source: "grants_gov",
    nativeId: "1",
    lane: "federal",
    jurisdiction: null,
    instrument: "grant",
    status: "posted",
    program,
    agency: { name: "NIH" },
    value: null,
    deadline: null,
    url: null,
    aln: ["93.310"],
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

describe("attachHistory", () => {
  it("leaves similarAwardees empty when no history rows are supplied", () => {
    const attached = attachHistory(
      [card("SBIR: digital nursing tools")],
      loadCompanyFixture("fixture-1"),
    );
    expect(attached[0].similarAwardees).toEqual([]);
  });

  it("attaches only supplied SBIR rows onto SBIR-shaped cards and does not invent firms", () => {
    const attached = attachHistory(
      [card("NIH SBIR Phase I: clinical workflow"), card("Open opportunity for hospitals")],
      loadCompanyFixture("fixture-1"),
      {
        sbirAwards: [
          {
            source: "sbir_csv",
            name: "Acme Health AI",
            amountUsd: 250000,
            year: 2024,
            state: "UT",
          },
        ],
        usaAwards: [
          {
            source: "usaspending",
            name: "Valley Clinic Systems",
            amountUsd: 900000,
            year: 2023,
            state: "UT",
          },
        ],
      },
    );
    expect(attached[0].similarAwardees.map((row) => row.name)).toEqual(["Acme Health AI"]);
    expect(attached[1].similarAwardees.map((row) => row.name)).toEqual(["Valley Clinic Systems"]);
    expect(attached.flatMap((row) => row.similarAwardees).every((row) => row.name.length > 0)).toBe(true);
  });

  it("does not copy USAspending rows onto State-lane cards", () => {
    const utah: RankedCard = {
      ...card("Utah SBDC advising"),
      opportunity: {
        ...card("Utah SBDC advising").opportunity,
        id: "curated:sbdc",
        source: "curated",
        nativeId: "sbdc",
        lane: "state",
        jurisdiction: "UT",
        aln: [],
      },
    };
    const attached = attachHistory([utah], loadCompanyFixture("fixture-5"), {
      usaAwards: [
        {
          source: "usaspending",
          name: "UNIVERSITY OF UTAH",
          year: 2024,
          state: "UT",
        },
      ],
    });
    expect(attached[0].similarAwardees).toEqual([]);
  });
});
