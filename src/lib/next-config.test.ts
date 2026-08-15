import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("next.config serverless traces", () => {
  it("includes the committed data trees on every route", () => {
    expect(nextConfig.outputFileTracingIncludes?.["/*"]).toEqual(["./data/**/*"]);
  });

  it("allows 127.0.0.1 to load Next.js dev resources", () => {
    expect(nextConfig.allowedDevOrigins).toEqual(["127.0.0.1"]);
  });
});
