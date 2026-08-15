import { describe, expect, it } from "vitest";
import { FOOTER_EMAIL } from "@/lib/copy";
import {
  LEFTOVER_WATCH_MAIL_UNAVAILABLE,
  LEFTOVER_WATCH_STORAGE_KEY,
  persistLeftoverWatch,
  submitLeftoverWatch,
} from "./leftover-watch";

describe("leftover saved search", () => {
  it("records a map watch without pretending a digest was mailed", () => {
    expect(
      submitLeftoverWatch({
        scope: "map",
        email: "not-an-email",
        label: "Map: all Utah startups",
        filter: {},
        cadence: "weekly",
      }),
    ).toEqual({
      ok: false,
      error: "Enter a valid email.",
    });
    expect(
      submitLeftoverWatch({
        scope: "talent",
        email: "you@example.com",
        label: "Hiring: any Utah company",
        filter: { sectors: [], regions: [] },
        cadence: "weekly",
      }),
    ).toEqual({
      ok: true,
      mailed: false,
      email: "you@example.com",
      label: "Hiring: any Utah company",
      cadence: "weekly",
      message: LEFTOVER_WATCH_MAIL_UNAVAILABLE,
    });
    expect(LEFTOVER_WATCH_MAIL_UNAVAILABLE).toContain(FOOTER_EMAIL);
    expect(LEFTOVER_WATCH_MAIL_UNAVAILABLE).not.toMatch(/inbox|weekly digest/i);
  });

  it("writes an accepted watch to device storage", () => {
    const bag = new Map<string, string>();
    const storage = {
      getItem: (key: string) => bag.get(key) ?? null,
      setItem: (key: string, value: string) => {
        bag.set(key, value);
      },
    };
    expect(
      persistLeftoverWatch(
        {
          scope: "map",
          email: "you@example.com",
          label: "Map: all Utah startups",
          filter: { hiringOnly: true },
          cadence: "weekly",
        },
        storage,
        () => "2026-08-15T00:00:00.000Z",
      ),
    ).toMatchObject({ ok: true, mailed: false });
    expect(JSON.parse(bag.get(LEFTOVER_WATCH_STORAGE_KEY)!)).toEqual([
      {
        scope: "map",
        email: "you@example.com",
        label: "Map: all Utah startups",
        filter: { hiringOnly: true },
        cadence: "weekly",
        savedAt: "2026-08-15T00:00:00.000Z",
      },
    ]);
  });
});
