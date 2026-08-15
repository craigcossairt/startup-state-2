import { describe, expect, it } from "vitest";
import { NOT_PUBLISHED } from "@/lib/copy";
import { formatDeadline, formatInstrument } from "./display";

describe("display", () => {
  it("formats a published ISO deadline as a month-day-year date", () => {
    expect(formatDeadline("2027-04-05")).toBe("April 5, 2027");
    expect(formatDeadline(null)).toBe(NOT_PUBLISHED);
  });

  it("shows instrument as words, not enum slugs", () => {
    expect(formatInstrument("contracting_help")).toBe("contracting help");
    expect(formatInstrument("grant")).toBe("grant");
  });
});
