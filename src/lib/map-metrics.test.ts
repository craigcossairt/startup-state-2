import { describe, expect, it } from "vitest";
import { ranked } from "@/lib/bonus/test-cards";
import { summarizeMapMetrics } from "./map-metrics";
import type { OpportunityMapPayload } from "@/lib/types/opportunity";

function payload(overrides: Partial<OpportunityMapPayload> = {}): OpportunityMapPayload {
  return {
    cards: [
      {
        ...ranked({
          id: "grants_gov:1",
          fit: "likely",
          program: "NIH SBIR",
          deadline: "2026-09-01",
        }),
        opportunity: {
          ...ranked({ id: "grants_gov:1" }).opportunity,
          value: { minUsd: 100000, maxUsd: 250000 },
          deadline: "2026-09-01",
        },
        fit: "likely",
      },
      {
        ...ranked({
          id: "curated:nucleus-grow",
          fit: "potential-verify",
          program: "Nucleus",
        }),
        opportunity: {
          ...ranked({ id: "curated:nucleus-grow" }).opportunity,
          value: null,
          deadline: null,
        },
        fit: "potential-verify",
      },
      {
        ...ranked({
          id: "grants_gov:2",
          fit: "probably_not",
          program: "DoD",
          deadline: "2027-01-01",
        }),
        opportunity: {
          ...ranked({ id: "grants_gov:2" }).opportunity,
          value: { minUsd: 500000, maxUsd: 500000 },
          deadline: "2027-01-01",
        },
        fit: "probably_not",
      },
    ],
    floorTripped: false,
    floorBanner: null,
    retrievedIds: ["grants_gov:1", "curated:nucleus-grow", "grants_gov:2", "goeo:extra"],
    firedKeys: ["sbir-help"],
    ...overrides,
  };
}

describe("summarizeMapMetrics", () => {
  it("counts retrieved vs ranked, lane split, fit, published funding, and near deadlines", () => {
    const metrics = summarizeMapMetrics(payload(), "2026-08-14");
    expect(metrics.retrieved).toBe(4);
    expect(metrics.ranked).toBe(3);
    expect(metrics.federal).toBe(2);
    expect(metrics.utah).toBe(1);
    expect(metrics.likely).toBe(1);
    expect(metrics.potentialVerify).toBe(1);
    expect(metrics.probablyNot).toBe(1);
    expect(metrics.publishedMaxUsd).toBe(750000);
    expect(metrics.deadlinesWithin90Days).toBe(1);
  });

  it("treats missing value and deadline as not published, never inventing a dollar or date", () => {
    const metrics = summarizeMapMetrics(
      payload({
        cards: [
          ranked({ id: "curated:sbdc", fit: "adjacent", program: "SBDC" }),
        ],
        retrievedIds: ["curated:sbdc"],
      }),
      "2026-08-14",
    );
    expect(metrics.publishedMaxUsd).toBeNull();
    expect(metrics.deadlinesWithin90Days).toBe(0);
    expect(metrics.utah).toBe(1);
    expect(metrics.federal).toBe(0);
  });
});
