import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resourceSeedRow, startupSeedRow } from "./seed";

const startups = JSON.parse(
  readFileSync(path.join(process.cwd(), "data/catalog/startups.json"), "utf8"),
) as unknown[];
const resources = JSON.parse(
  readFileSync(path.join(process.cwd(), "data/catalog/resources.json"), "utf8"),
) as unknown[];

describe("catalog seed rows", () => {
  it("maps Alcomy without the JSON status column the schema does not have", () => {
    const row = startupSeedRow(startups[0]);
    expect(row).toEqual({
      slug: "alcomy",
      name: "Alcomy",
      website: "alcomy.com",
      linkedin_url: "http://www.linkedin.com/company/alcomy",
      description:
        "alphaMountain's mission is to build next-generation cybersecurity products and services to enhance malicious investigations and protect individuals on the Internet.",
      full_address: "815 West 1250 South, Orem, UT",
      city: "Orem",
      region: "Wasatch Front",
      lat: 40.30449375,
      lng: -111.7000375,
      sector: "Software",
      stage: null,
      employees_bucket: "Undisclosed",
      revenue_bucket: "Undisclosed",
      is_hiring: false,
    });
    expect(row).not.toHaveProperty("status");
  });

  it("drops status on every committed startup row", () => {
    expect(
      startups.some((row) => row && typeof row === "object" && "status" in row),
    ).toBe(true);
    for (const raw of startups) {
      expect(startupSeedRow(raw)).not.toHaveProperty("status");
    }
  });

  it("maps the first GOEO resource onto the schema columns", () => {
    const row = resourceSeedRow(resources[0]);
    expect(row.external_id).toBe("2543");
    expect(row.title).toBe("Utah Department of Workforce Services");
    expect(row.link).toBe("https://jobs.utah.gov/");
    expect(row.email).toBeNull();
    expect(row.topics).toEqual(["Late Stage Growth"]);
    expect(row.industries).toHaveLength(10);
    expect(row.locations).toHaveLength(29);
    expect(row.locations[0]).toBe("Beaver");
    expect(row.locations[28]).toBe("Weber");
    expect(Object.keys(row).sort()).toEqual([
      "communities",
      "description",
      "email",
      "external_id",
      "industries",
      "link",
      "locations",
      "title",
      "topics",
    ]);
  });
});
