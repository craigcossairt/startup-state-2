import { describe, expect, it } from "vitest";
import { encodeRankStreamEvent, parseRankStreamBlock } from "./stream-events";

describe("rank stream events", () => {
  it("round-trips SSE data lines for progress, retrieved, card, and done", () => {
    const progress = encodeRankStreamEvent({
      type: "progress",
      stage: "retrieve",
      message: "Searching federal and Utah programs",
    });
    const retrieved = encodeRankStreamEvent({
      type: "retrieved",
      retrievedIds: ["curated:nucleus-grow"],
      firedKeys: ["sbir-help"],
      federal: 3,
      utah: 2,
    });
    const card = encodeRankStreamEvent({
      type: "card",
      card: { opportunity: { id: "curated:nucleus-grow" } },
    });
    const done = encodeRankStreamEvent({
      type: "done",
      floorTripped: false,
    });

    expect(progress.startsWith("data: ")).toBe(true);
    expect(progress.endsWith("\n\n")).toBe(true);
    expect(parseRankStreamBlock(progress)).toEqual({
      type: "progress",
      stage: "retrieve",
      message: "Searching federal and Utah programs",
    });
    expect(parseRankStreamBlock(retrieved)).toMatchObject({
      type: "retrieved",
      federal: 3,
      utah: 2,
    });
    expect(parseRankStreamBlock(card)).toMatchObject({ type: "card" });
    expect(parseRankStreamBlock(done)).toEqual({ type: "done", floorTripped: false });
  });
});
