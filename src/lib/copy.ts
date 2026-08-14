import type { FixtureId } from "@/lib/types/company-profile";

export const INTAKE_HERO = "Tell us about your company.";

export const FLOOR_BANNER =
  "Traditional federal grants look like a poor fit for this company. Utah programs below are the stronger place to start.";

export const NOT_PUBLISHED = "Not published";

export const FIXTURE_CHIPS: { id: FixtureId; label: string }[] = [
  { id: "fixture-1", label: "Healthcare AI" },
  { id: "fixture-2", label: "Aerospace" },
  { id: "fixture-3", label: "Water / climate" },
  { id: "fixture-4", label: "Cyber" },
  { id: "fixture-5", label: "Youth marketplace (honest-no)" },
];

export const GOEO_KEY_LABELS: Record<
  "sbir-help" | "contracting" | "state-capital" | "workforce" | "counseling" | "trade",
  string
> = {
  "sbir-help": "SBIR help",
  contracting: "Contracting",
  "state-capital": "State capital",
  workforce: "Workforce",
  counseling: "Counseling",
  trade: "Trade",
};

export const FIT_LABELS = {
  likely: "likely",
  "potential-verify": "potential-verify",
  adjacent: "adjacent",
  probably_not: "probably not",
} as const;
