import { describe, expect, it } from "vitest";
import { hasPublicMapboxToken, readMapboxPublicToken } from "./mapbox";

describe("Mapbox public token", () => {
  it("accepts only a pk public token", () => {
    expect(hasPublicMapboxToken({})).toBe(false);
    expect(hasPublicMapboxToken({ NEXT_PUBLIC_MAPBOX_TOKEN: "   " })).toBe(false);
    expect(hasPublicMapboxToken({ NEXT_PUBLIC_MAPBOX_TOKEN: "sk.secret" })).toBe(false);
    expect(hasPublicMapboxToken({ NEXT_PUBLIC_MAPBOX_TOKEN: "pk.live-token" })).toBe(true);
  });

  it("reads a pk token from MAPBOX_TOKEN when the public name is missing", () => {
    expect(
      readMapboxPublicToken({ MAPBOX_TOKEN: "pk.from-vercel" }),
    ).toBe("pk.from-vercel");
    expect(readMapboxPublicToken({ MAPBOX_TOKEN: "sk.secret" })).toBeNull();
  });
});
