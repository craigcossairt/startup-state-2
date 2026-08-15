import { describe, expect, it } from "vitest";
import { PLAYBOOK_STEPS } from "./playbook";
import {
  filterResources,
  filterStartups,
  hiringStartups,
  officialJobBoards,
  resourcesForStep,
} from "./filter";
import type { CatalogResource, CatalogStartup } from "./types";

const resources: CatalogResource[] = [
  {
    id: "1",
    externalId: "1",
    title: "Utah Department of Workforce Services",
    description: "Job board and training.",
    communities: [],
    industries: [],
    locations: ["Salt Lake"],
    topics: ["Late Stage Growth"],
    link: "https://jobs.utah.gov",
    email: null,
  },
  {
    id: "2",
    externalId: "2",
    title: "Utah Microloan Fund",
    description: "Small loans for founders.",
    communities: ["Woman-owned"],
    industries: [],
    locations: [],
    topics: ["Funding"],
    link: "https://example.com/microloan",
    email: null,
  },
];

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

describe("catalog filters", () => {
  it("filters resources by topic and search text", () => {
    expect(filterResources(resources, { topic: "Funding" }).map((row) => row.id)).toEqual(["2"]);
    expect(filterResources(resources, { q: "workforce" }).map((row) => row.id)).toEqual(["1"]);
  });

  it("ties playbook funding steps to funding resources", () => {
    const step = PLAYBOOK_STEPS.find((item) => item.stepId === "fund-small-business");
    expect(step).toBeTruthy();
    expect(resourcesForStep(step!, resources).map((row) => row.title)).toEqual([
      "Utah Microloan Fund",
    ]);
  });

  it("filters startups and treats careersUrl as hiring", () => {
    expect(filterStartups(startups, { sector: "Software" }).map((row) => row.id)).toEqual([
      "hire-me",
    ]);
    expect(hiringStartups(startups).map((row) => row.id)).toEqual(["hire-me"]);
    expect(officialJobBoards(resources)[0]?.title).toContain("Workforce Services");
  });
});
