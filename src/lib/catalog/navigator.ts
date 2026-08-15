import { PLAYBOOK_STEPS } from "./playbook";

export function navigatorCatalogHint(message: string, surface?: string): string {
  const words = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3);
  const matches = PLAYBOOK_STEPS.filter((step) => {
    const hay = `${step.title} ${step.summary} ${step.resourceTopics.join(" ")}`.toLowerCase();
    return words.some((word) => hay.includes(word));
  }).slice(0, 3);
  if (matches.length > 0) {
    const lines = matches.map((step) => `${step.title} (${step.sourceUrl})`);
    return `Start with these playbook steps: ${lines.join("; ")}. The GOED directory is on /resources. Rank a company on Intake if you want a fitted Opportunity Map.`;
  }
  if (surface === "startups" || surface === "careers") {
    return "The Utah startup directory is on /startups. Claim a listing from the map, or add one at /startups/add. Hiring companies are on /careers.";
  }
  if (surface === "resources") {
    return "The GOED directory is on /resources. Filter by topic or community, or rank a company on Intake for a fitted Opportunity Map.";
  }
  if (surface === "map") {
    return "Rank a company on Intake if this Opportunity Map is empty. I can only name programs that are already on the map.";
  }
  return "I can walk the Utah playbook, the GOED resource directory, or a ranked Opportunity Map. Open /playbook for the 19 official steps, /resources for the 213 programs, or rank a company on Intake.";
}
