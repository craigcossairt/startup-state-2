import { readFileSync } from "node:fs";
import type { CompanyProfile, FixtureId } from "@/lib/types/company-profile";
import { dataPath } from "@/lib/paths";

export const FIXTURE_IDS: FixtureId[] = [
  "fixture-1",
  "fixture-2",
  "fixture-3",
  "fixture-4",
  "fixture-5",
];

export function loadCompanyFixture(id: FixtureId): CompanyProfile {
  const raw = readFileSync(
    dataPath("fixtures", `company-profile.${id}.json`),
    "utf8",
  );
  return JSON.parse(raw) as CompanyProfile;
}
