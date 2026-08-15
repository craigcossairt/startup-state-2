import { FOOTER_EMAIL } from "@/lib/copy";
import { ALL_REGIONS, ALL_SECTORS, ALL_STAGES } from "./map-filters";

export const ADD_LISTING_NOT_PUBLISHED = `This listing is not published. Email ${FOOTER_EMAIL} with the company details. After GOED adds it to the catalog, you can claim it from the map.`;

export type AddListingInput = {
  name: string;
  website: string;
  description?: string;
  sector: string;
  stage: string;
  region: string;
  city?: string;
  fullAddress?: string;
  submitterEmail: string;
};

export type AddListingResult =
  | { ok: true; published: false; name: string; message: string }
  | { ok: false; error: string };

export function submitAddListing(input: AddListingInput): AddListingResult {
  const name = input.name.trim();
  if (name.length < 2) {
    return { ok: false, error: "Company name must be at least 2 characters." };
  }
  const website = input.website.trim();
  if (website.length < 3) {
    return { ok: false, error: "Enter a website." };
  }
  const email = input.submitterEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email." };
  }
  if (!(ALL_SECTORS as readonly string[]).includes(input.sector)) {
    return { ok: false, error: "Pick a sector." };
  }
  if (!(ALL_STAGES as readonly string[]).includes(input.stage)) {
    return { ok: false, error: "Pick a stage." };
  }
  if (!(ALL_REGIONS as readonly string[]).includes(input.region)) {
    return { ok: false, error: "Pick a region." };
  }
  return {
    ok: true,
    published: false,
    name,
    message: ADD_LISTING_NOT_PUBLISHED,
  };
}
