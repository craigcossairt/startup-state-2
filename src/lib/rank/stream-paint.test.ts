import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { pendingCardsFromPreviews } from "@/lib/map-metrics";
import { cardsReadyToPaint } from "@/lib/rank/stream-paint";
import type { FitLabel, RankedCard } from "@/lib/types/opportunity";

const root = process.cwd();

function read(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

const ALL_FITS: Record<FitLabel, boolean> = {
  likely: true,
  "potential-verify": true,
  adjacent: true,
  probably_not: true,
};

describe("stream paint: completed cards only", () => {
  it("hides ranking placeholders so empty shells never appear before fit content", () => {
    const pending = pendingCardsFromPreviews([
      {
        id: "grants_gov:359671",
        program: "Parent SBIR",
        lane: "federal",
        agency: "HHS",
      },
    ]);
    const ranked: RankedCard = {
      ...pending[0]!,
      ranking: undefined,
      fit: "likely",
      why: "Matches healthcare AI nurses in Utah.",
      concerns: [],
      nextStep: { label: "Open on Grants.gov", url: "https://example.com" },
      similarAwardees: [],
    };

    expect(pending[0]?.why).toBe("");
    expect(cardsReadyToPaint(pending, ALL_FITS)).toEqual([]);
    expect(cardsReadyToPaint([ranked, ...pending], ALL_FITS)).toEqual([ranked]);
  });

  it("map seeds only completed streamed cards, not retrieved placeholders", () => {
    const map = read("src/components/opportunity-map.tsx");
    expect(map).toContain("cardsReadyToPaint");
    expect(map).not.toContain("pendingCardsFromPreviews");
    expect(map).not.toMatch(/setCards\(pendingCardsFromPreviews/);
    expect(map).toContain("retrievedIds.length");
  });
});
