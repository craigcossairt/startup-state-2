import { describe, expect, it } from "vitest";
import { applyStartupMapFilters, filtersToParams, paramsToFilters } from "./map-filters";
import type { CatalogStartup } from "./types";

const startups: CatalogStartup[] = [
  {
    id: "acme",
    slug: "acme",
    name: "Acme Robotics",
    website: "acme.test",
    linkedinUrl: null,
    description: "Warehouse robots in Ogden.",
    fullAddress: null,
    city: "Ogden",
    region: "Northern Utah",
    lat: 41.2,
    lng: -111.9,
    sector: "Manufacturing",
    stage: "Seed",
    employeesBucket: "11-50",
    revenueBucket: "<$1M",
    foundingYear: 2022,
    isHiring: false,
    careersUrl: null,
  },
  {
    id: "hire-me",
    slug: "hire-me",
    name: "Hire Me",
    website: "hireme.test",
    linkedinUrl: null,
    description: "Payroll software.",
    fullAddress: null,
    city: "Lehi",
    region: "Wasatch Front",
    lat: 40.3,
    lng: -111.8,
    sector: "Software",
    stage: "SeriesA",
    employeesBucket: "51-200",
    revenueBucket: "$1M-$10M",
    foundingYear: 2019,
    isHiring: true,
    careersUrl: "https://hireme.test/jobs",
  },
];

describe("startup map filters", () => {
  it("round-trips URL filters and keeps hiring-only as a leftover map control", () => {
    const params = new URLSearchParams(
      "sector=Software&stage=SeriesA&region=Wasatch Front&revenue=$1M-$10M&hiring=true&startup=hire-me",
    );
    const filters = paramsToFilters(params);
    expect([...filters.sectors]).toEqual(["Software"]);
    expect(filters.hiringOnly).toBe(true);
    const next = filtersToParams(filters, params);
    expect(next.get("startup")).toBe("hire-me");
    expect(next.get("hiring")).toBe("true");
    expect(applyStartupMapFilters(startups, filters).map((row) => row.id)).toEqual(["hire-me"]);
  });
});
