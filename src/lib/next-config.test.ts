import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("next.config serverless traces", () => {
  it("includes the committed data trees on every route", () => {
    expect(nextConfig.outputFileTracingIncludes?.["/*"]).toEqual(["./data/**/*"]);
  });
});
