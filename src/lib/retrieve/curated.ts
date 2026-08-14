import { readFileSync } from "node:fs";
import { dataPath } from "@/lib/paths";
import type { Opportunity } from "@/lib/types/opportunity";

let cached: Opportunity[] | null = null;

export function loadCuratedUtahCards(): Opportunity[] {
  if (cached) return cached;
  const raw = readFileSync(dataPath("curated", "utah-cards.json"), "utf8");
  cached = JSON.parse(raw) as Opportunity[];
  return cached;
}
