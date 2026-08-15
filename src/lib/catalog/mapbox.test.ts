import { describe, expect, it } from "vitest";
import { hasPublicMapboxToken } from "./mapbox";

describe("Mapbox public token", () => {
  it("accepts only a pk public token", () => {
    expect(hasPublicMapboxToken({})).toBe(false);
    expect(hasPublicMapboxToken({ NEXT_PUBLIC_MAPBOX_TOKEN: "   " })).toBe(false);
    expect(hasPublicMapboxToken({ NEXT_PUBLIC_MAPBOX_TOKEN: "sk.secret" })).toBe(false);
    expect(hasPublicMapboxToken({ NEXT_PUBLIC_MAPBOX_TOKEN: "pk.live-token" })).toBe(true);
  });
});
