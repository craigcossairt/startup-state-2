import { describe, expect, it } from "vitest";
import { twelveMonthStrategy } from "./strategy";
import { ranked } from "./test-cards";

describe("twelveMonthStrategy", () => {
  it("orders dated cards by deadline then standing, and drops dates past 12 months", () => {
    const now = new Date("2026-08-14T00:00:00Z");
    const ordered = twelveMonthStrategy(
      [
        ranked({ id: "curated:sbdc", status: "standing", deadline: null }),
        ranked({ id: "grants_gov:late", deadline: "2028-01-01" }),
        ranked({ id: "grants_gov:b", deadline: "2026-12-01" }),
        ranked({ id: "grants_gov:a", deadline: "2026-09-01" }),
      ],
      now,
    );
    expect(ordered.map((card) => card.opportunity.id)).toEqual([
      "grants_gov:a",
      "grants_gov:b",
      "curated:sbdc",
    ]);
  });
});
