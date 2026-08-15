import { PLAYBOOK_STEPS } from "./playbook";

export function navigatorCatalogHint(message: string): string {
  const needle = message.toLowerCase();
  const matches = PLAYBOOK_STEPS.filter((step) => {
    const hay = `${step.title} ${step.summary} ${step.resourceTopics.join(" ")}`.toLowerCase();
    return needle.split(/\s+/).some((word) => word.length > 3 && hay.includes(word));
  }).slice(0, 3);
  if (matches.length > 0) {
    const lines = matches.map((step) => `${step.title} (${step.sourceUrl})`);
    return `Start with these playbook steps: ${lines.join("; ")}. The GOEO directory is on /resources. Rank a company on Intake if you want a fitted Opportunity Map.`;
  }
  return "I can walk the Utah playbook, the GOEO resource directory, or a ranked Opportunity Map. Open /playbook for the 19 official steps, /resources for the 213 programs, or rank a company on Intake.";
}
