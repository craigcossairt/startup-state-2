import { describe, expect, it } from "vitest";
import { alertWatchesFromCards, toggleAlertWatch } from "./alerts";
import { ranked } from "./test-cards";

describe("alert watches", () => {
  it("watches opportunity.id plus deadline and can toggle a watch in session", () => {
    const cards = [
      ranked({ id: "grants_gov:359671", deadline: "2026-10-19" }),
      ranked({ id: "curated:nucleus-grow", deadline: null }),
    ];
    const keys = alertWatchesFromCards(cards);
    expect(keys).toEqual([
      { id: "grants_gov:359671", deadline: "2026-10-19" },
      { id: "curated:nucleus-grow", deadline: null },
    ]);
    const watched = toggleAlertWatch([], keys[0]);
    expect(watched).toEqual([keys[0]]);
    expect(toggleAlertWatch(watched, keys[0])).toEqual([]);
  });
});
