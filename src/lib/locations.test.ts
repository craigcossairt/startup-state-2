import { describe, expect, it } from "vitest";
import {
  DEFAULT_HQ_COUNTRY,
  DEFAULT_HQ_STATE,
  COUNTRIES,
  US_STATES,
} from "./locations";

describe("location pickers", () => {
  it("lists United States and Utah so the intake defaults can be selected by typing", () => {
    expect(COUNTRIES.find((row) => row.code === DEFAULT_HQ_COUNTRY)?.name).toBe(
      "United States",
    );
    expect(US_STATES.find((row) => row.code === DEFAULT_HQ_STATE)?.name).toBe("Utah");
    expect(COUNTRIES.some((row) => row.name === "Canada")).toBe(true);
    expect(US_STATES).toHaveLength(51);
  });

  it("keeps codes stable for retrieve (US / UT), not display names", () => {
    expect(DEFAULT_HQ_COUNTRY).toBe("US");
    expect(DEFAULT_HQ_STATE).toBe("UT");
    expect(US_STATES.every((row) => row.code.length === 2)).toBe(true);
  });
});
