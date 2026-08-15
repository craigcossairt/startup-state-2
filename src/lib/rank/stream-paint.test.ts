import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
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

function shellCard(overrides: Partial<RankedCard> & Pick<RankedCard, "why" | "ranking">): RankedCard {
  return {
    opportunity: {
      id: "grants_gov:359671",
      source: "grants_gov",
      nativeId: "359671",
      lane: "federal",
      jurisdiction: null,
      instrument: "other",
      status: "posted",
      program: "Parent SBIR",
      agency: { name: "HHS" },
      value: null,
      deadline: null,
      url: null,
      aln: [],
      description: null,
    },
    fit: "adjacent",
    concerns: [],
    nextStep: { label: "Open on Grants.gov", url: "https://example.com" },
    similarAwardees: [],
    ...overrides,
  };
}

describe("stream paint: completed cards only", () => {
  it("hides ranking placeholders so empty shells never appear before fit content", () => {
    const pending = shellCard({ ranking: true, why: "" });
    const ranked = shellCard({
      ranking: undefined,
      fit: "likely",
      why: "Matches healthcare AI nurses in Utah.",
    });

    expect(pending.why).toBe("");
    expect(cardsReadyToPaint([pending], ALL_FITS)).toEqual([]);
    expect(cardsReadyToPaint([ranked, pending], ALL_FITS)).toEqual([ranked]);
  });

  it("map seeds only completed streamed cards, not retrieved placeholders", () => {
    const map = read("src/components/opportunity-map.tsx");
    expect(map).toContain("cardsReadyToPaint");
    expect(map).not.toContain("pendingCardsFromPreviews");
    expect(map).not.toMatch(/setCards\(pendingCardsFromPreviews/);
    expect(map).toContain("retrievedIds.length");
  });
});
