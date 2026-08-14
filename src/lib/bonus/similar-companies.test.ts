import { describe, expect, it } from "vitest";
import { similarCompaniesFromCards } from "./similar-companies";
import { ranked } from "./test-cards";

describe("similarCompaniesFromCards", () => {
  it("lists only names already on similarAwardees and stays empty when none attached", () => {
    const acme = {
      source: "sbir_csv" as const,
      name: "Acme Health AI",
      year: 2024,
      state: "UT",
    };
    const cards = [
      ranked({ id: "grants_gov:1", similarAwardees: [acme] }),
      ranked({ id: "curated:sbdc", similarAwardees: [] }),
    ];
    expect(similarCompaniesFromCards(cards).map((row) => row.name)).toEqual([
      "Acme Health AI",
    ]);
    expect(similarCompaniesFromCards([ranked({ id: "curated:usbci" })])).toEqual([]);
  });
});
