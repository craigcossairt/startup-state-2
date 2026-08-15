import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

describe("map stream and KPIs", () => {
  it("reads rank as a stream, shows progress, and renders metrics before the card dump", () => {
    const map = read("src/components/opportunity-map.tsx");
    const route = read("src/app/api/rank/route.ts");
    expect(route).toContain("text/event-stream");
    expect(route).toContain("streamRetrieveThenRank");
    expect(map).toContain("text/event-stream");
    expect(map).toContain("summarizeMapMetrics");
    expect(map).toContain("ProgressStatus");
    expect(map).toContain("MapMetrics");
    expect(map).toContain("cardsReadyToPaint");
    expect(map).not.toContain("pendingCardsFromPreviews");
    expect(map).not.toContain("Building the Opportunity Map...");
  });

  it("lets Intake scrape a website and show progress instead of a silent wait", () => {
    const intake = read("src/components/intake.tsx");
    expect(intake).toContain("/api/scrape");
    expect(intake).toContain("websiteUrl");
    expect(intake).toContain("ProgressStatus");
    expect(intake).toContain("DEFAULT_HQ_COUNTRY");
    expect(intake).toContain("DEFAULT_HQ_STATE");
  });
});
