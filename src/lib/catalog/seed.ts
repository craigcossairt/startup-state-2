import { parseResource, parseStartup } from "./parse";

export type ResourceSeedRow = {
  external_id: string | null;
  title: string;
  description: string | null;
  communities: string[];
  industries: string[];
  locations: string[];
  topics: string[];
  link: string | null;
  email: string | null;
};

export type StartupSeedRow = {
  slug: string;
  name: string;
  website: string | null;
  linkedin_url: string | null;
  description: string | null;
  full_address: string | null;
  city: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
  sector: string;
  stage: string | null;
  employees_bucket: string;
  revenue_bucket: string;
  is_hiring: boolean;
};

export function resourceSeedRow(raw: unknown): ResourceSeedRow {
  const parsed = parseResource(raw, 0);
  if (!parsed) throw new Error("invalid resource seed row");
  return {
    external_id: parsed.externalId,
    title: parsed.title,
    description: parsed.description,
    communities: parsed.communities,
    industries: parsed.industries,
    locations: parsed.locations,
    topics: parsed.topics,
    link: parsed.link,
    email: parsed.email,
  };
}

export function startupSeedRow(raw: unknown): StartupSeedRow {
  const parsed = parseStartup(raw, 0);
  if (!parsed) throw new Error("invalid startup seed row");
  return {
    slug: parsed.slug,
    name: parsed.name,
    website: parsed.website,
    linkedin_url: parsed.linkedinUrl,
    description: parsed.description,
    full_address: parsed.fullAddress,
    city: parsed.city,
    region: parsed.region,
    lat: parsed.lat,
    lng: parsed.lng,
    sector: parsed.sector,
    stage: parsed.stage,
    employees_bucket: parsed.employeesBucket,
    revenue_bucket: parsed.revenueBucket,
    is_hiring: parsed.isHiring,
  };
}
