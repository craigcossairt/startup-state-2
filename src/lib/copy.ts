import type { FixtureId } from "@/lib/types/company-profile";

export const INTAKE_HERO = "Tell us about your company.";

export const INTAKE_LEAD =
  "Share your website, describe the company, or pick a test case. We rank retrieved federal and Utah programs by fit. This is not a determination that you can apply.";

export const INTAKE_WHAT_THEY_DO_LABEL = "What does the company do?";

export const INTAKE_WHAT_THEY_DO_HINT =
  "We build AI software that cuts hospital paperwork for nurses. We sell to U.S. health systems, use machine learning on clinical notes, and are based in Salt Lake City with 15 people. We have $1M ARR, have raised $2.5M, and need $500k to $2M for product development and hospital pilots.";

export const INTAKE_WEBSITE_LABEL = "Company website";

export const INTAKE_WEBSITE_HINT = "https://www.yourcompany.com";

export const FLOOR_BANNER =
  "Traditional federal grants look like a poor fit for this company. Utah programs below are the stronger place to start.";

export const NOT_PUBLISHED = "Not published";

export const TEST_CASES_LABEL = "Test cases";

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

export const FOOTER_CONNECT_EYEBROW = "Let's connect";
export const FOOTER_OFFICIAL_LINE = "An official state of Utah website";
export const FOOTER_NEWSLETTER_EYEBROW = "Email Newsletter";
export const FOOTER_NEWSLETTER_BODY =
  "Sign up for our monthly newsletter to learn more about GOEO programs and ecosystem activity.";
export const FOOTER_NEWSLETTER_CTA = "Subscribe to Newsletter";
export const FOOTER_GOEO_NAME =
  "Utah Governor's Office of Economic Opportunity (GOEO)";
export const FOOTER_GOEO_ADDRESS_1 = "60 East South Temple, Suite 300";
export const FOOTER_GOEO_ADDRESS_2 = "Salt Lake City, Utah 84111-1041";
export const FOOTER_EMAIL = "business@utah.gov";
export const FOOTER_NEWSLETTER_URL =
  "https://cdn.forms-content.sg-form.com/06b418c5-1057-11ee-9a80-ca5180dad175";
export const WELCOME_BACK_BANNER =
  "Welcome back. We saved your last Opportunity Map.";
export const WELCOME_BACK_ACTION = "Open last Opportunity Map";
export const ASK_FAB_LABEL = "Ask the map";
export const ASK_PANEL_LEAD =
  "Questions stay on programs already retrieved for this company.";
export const ASK_NEEDS_MAP =
  "Rank a company first. Then I can talk about programs on that Opportunity Map.";
export const ASK_PLACEHOLDER = "What should I do first on this map?";
