import type { FixtureId } from "@/lib/types/company-profile";

export const INTAKE_HERO = "Tell us about your company.";

export const INTAKE_LEAD =
  "Share your website, describe the company, or pick a fixture. We rank retrieved federal and Utah programs by fit. This is not a determination that you can apply.";

export const INTAKE_WHAT_THEY_DO_LABEL = "What does the company do?";

export const INTAKE_WHAT_THEY_DO_HINT =
  "We build AI software that cuts hospital paperwork for nurses. We sell to U.S. health systems, use machine learning on clinical notes, and are based in Salt Lake City with 15 people. We have $1M ARR, have raised $2.5M, and need $500k to $2M for product development and hospital pilots.";

export const INTAKE_WEBSITE_LABEL = "Company website";

export const INTAKE_WEBSITE_HINT = "https://www.yourcompany.com";

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
