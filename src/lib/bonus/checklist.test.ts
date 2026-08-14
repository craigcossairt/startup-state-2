import { describe, expect, it } from "vitest";
import { applicationChecklist } from "./checklist";
import { ranked } from "./test-cards";

describe("applicationChecklist", () => {
  it("builds one step from each card nextStep and official url", () => {
    const cards = [
      ranked({
        id: "curated:nucleus-grow",
        nextStep: { label: "Review Nucleus Grow", url: "https://www.nucleusutah.org/grow" },
      }),
      ranked({
        id: "grants_gov:359671",
        nextStep: { label: "Open Parent SBIR listing" },
        url: "https://www.grants.gov/search-results-detail/359671",
      }),
    ];
    expect(applicationChecklist(cards)).toEqual([
      {
        id: "curated:nucleus-grow",
        label: "Review Nucleus Grow",
        url: "https://www.nucleusutah.org/grow",
      },
      {
        id: "grants_gov:359671",
        label: "Open Parent SBIR listing",
        url: "https://www.grants.gov/search-results-detail/359671",
      },
    ]);
  });

  it("does not invent steps when nextStep is empty", () => {
    expect(
      applicationChecklist([
        ranked({ id: "goeo:2654", nextStep: { label: "" } }),
      ]),
    ).toEqual([]);
  });
});
