import { describe, expect, it } from "vitest";
import { draftRevenueAmount, formatUsdDraft, parseUsdDraft } from "./usd-draft";

describe("usd draft", () => {
  it("formats empty, zero, and a populated amount without grouping", () => {
    expect(formatUsdDraft(undefined)).toBe("");
    expect(formatUsdDraft(0)).toBe("$0");
    expect(formatUsdDraft(1200)).toBe("$1200");
  });

  it("parses dollar signs and spaces into a bare amount", () => {
    expect(parseUsdDraft("")).toBeUndefined();
    expect(parseUsdDraft("$")).toBeUndefined();
    expect(parseUsdDraft("   ")).toBeUndefined();
    expect(parseUsdDraft("1200")).toBe(1200);
    expect(parseUsdDraft("$1200")).toBe(1200);
    expect(parseUsdDraft(" $ 1200 ")).toBe(1200);
  });

  it("rejects negatives", () => {
    expect(parseUsdDraft("-1")).toBeUndefined();
    expect(parseUsdDraft("$-1200")).toBeUndefined();
    expect(parseUsdDraft("-$1200")).toBeUndefined();
  });

  it("preserves an existing revenue basis when only the amount changes", () => {
    expect(draftRevenueAmount({ basis: "arr", amountUsd: 500 }, 1200)).toEqual({
      basis: "arr",
      amountUsd: 1200,
    });
    expect(draftRevenueAmount(undefined, 1200)).toEqual({
      basis: "annual_revenue",
      amountUsd: 1200,
    });
    expect(draftRevenueAmount({ basis: "arr", amountUsd: 500 }, undefined)).toBeUndefined();
  });
});
