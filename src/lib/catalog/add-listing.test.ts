import { describe, expect, it } from "vitest";
import { FOOTER_EMAIL } from "@/lib/copy";
import { ADD_LISTING_NOT_PUBLISHED, submitAddListing } from "./add-listing";

describe("add listing", () => {
  it("accepts a complete form without publishing a live listing", () => {
    expect(
      submitAddListing({
        name: "A",
        website: "acme.com",
        submitterEmail: "you@acme.com",
        sector: "Software",
        stage: "Seed",
        region: "Wasatch Front",
      }),
    ).toEqual({ ok: false, error: "Company name must be at least 2 characters." });
    expect(
      submitAddListing({
        name: "Acme Industries",
        website: "acme.com",
        submitterEmail: "not-an-email",
        sector: "Software",
        stage: "Seed",
        region: "Wasatch Front",
      }),
    ).toEqual({ ok: false, error: "Enter a valid email." });
    expect(
      submitAddListing({
        name: "Acme Industries",
        website: "acme.com",
        description: "Warehouse robots.",
        sector: "Software",
        stage: "Seed",
        region: "Wasatch Front",
        city: "Lehi",
        fullAddress: "123 Main",
        submitterEmail: "you@acme.com",
      }),
    ).toEqual({
      ok: true,
      published: false,
      name: "Acme Industries",
      message: ADD_LISTING_NOT_PUBLISHED,
    });
    expect(ADD_LISTING_NOT_PUBLISHED).toContain(FOOTER_EMAIL);
    expect(ADD_LISTING_NOT_PUBLISHED).not.toMatch(/approved|business day|goes live/i);
  });
});
