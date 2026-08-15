import { describe, expect, it } from "vitest";
import {
  TECH_TOKEN_SUGGESTIONS,
  commitTechToken,
  normalizeTechToken,
  suggestTechTokens,
} from "./tech-tokens";

const FIXTURE_TOKENS = [
  "ai",
  "saas",
  "healthcare software",
  "manufacturing",
  "aerospace",
  "sensors",
  "iot",
  "cybersecurity",
  "marketplace",
  "mobile",
] as const;

describe("tech tokens", () => {
  it("normalizes trim, case, and collapsed spaces", () => {
    expect(normalizeTechToken("  Healthcare   Software ")).toBe("healthcare software");
  });

  it("commitTechToken is idempotent and keeps prior tokens", () => {
    const added = commitTechToken(["ai", "saas"], "IoT");
    expect(added).toEqual(["ai", "saas", "iot"]);
    expect(commitTechToken(added, "  iot  ")).toEqual(["ai", "saas", "iot"]);
    expect(commitTechToken(["ai"], "   ")).toEqual(["ai"]);
  });

  it("suggestTechTokens filters and offers a create row for an unknown query", () => {
    const health = suggestTechTokens("health", ["saas"]);
    expect(health.some((row) => row.token === "healthcare software" && row.kind === "match")).toBe(
      true,
    );
    expect(health.some((row) => row.token === "saas")).toBe(false);

    const unknown = suggestTechTokens("quantum", ["ai"]);
    expect(unknown.some((row) => row.token === "quantum" && row.kind === "create")).toBe(true);
    expect(unknown.some((row) => row.token === "ai")).toBe(false);
  });

  it("lists the fixture tokens as suggestions", () => {
    for (const token of FIXTURE_TOKENS) {
      expect(TECH_TOKEN_SUGGESTIONS).toContain(token);
    }
  });
});
