import { describe, expect, it } from "vitest";
import { groupByAgency } from "./agency-map";
import { ranked } from "./test-cards";

describe("groupByAgency", () => {
  it("groups the current Ranked cards by agency.name", () => {
    const groups = groupByAgency([
      ranked({ id: "grants_gov:1", agency: "NIH", program: "Parent SBIR" }),
      ranked({ id: "grants_gov:2", agency: "NIH", program: "M2C" }),
      ranked({ id: "curated:nucleus-grow", agency: "Nucleus" }),
    ]);
    expect(groups.map((group) => group.agency)).toEqual(["NIH", "Nucleus"]);
    expect(groups[0].cards.map((card) => card.opportunity.id)).toEqual([
      "grants_gov:1",
      "grants_gov:2",
    ]);
  });
});
