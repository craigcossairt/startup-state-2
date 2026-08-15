import type { FixtureId } from "@/lib/types/company-profile";

export const INTAKE_HERO = "Tell us about your company.";

export const INTAKE_LEAD =
  "Share your website, describe the company, or pick a test case. We rank retrieved federal and Utah programs by fit. This is not a determination that you can apply.";

export const INTAKE_WHAT_THEY_DO_LABEL = "What does the company do?";

export const INTAKE_WHAT_THEY_DO_HINT =
  "We build AI software that cuts hospital paperwork for nurses. We sell to U.S. health systems, use machine learning on clinical notes, and are based in Salt Lake City with 15 people. We have $1M ARR, have raised $2.5M, and need $500k to $2M for product development and hospital pilots.";

export const INTAKE_WEBSITE_LABEL = "Company website";

export const INTAKE_WEBSITE_HINT = "https://www.yourcompany.com";

export const INTAKE_WEBSITE_HELP =
  "Optional. We read the public page and fill what we can.";

export const INTAKE_SHAPE_HINT =
  "The more of that shape you give us, the fewer questions we ask next.";

export const INTAKE_LANDING_EYEBROW =
  "/ Welcome to the Startup Capital of the World /";

export const INTAKE_LANDING_TITLE = "Start Something Here";

export const INTAKE_LANDING_LEAD =
  "The Startup State Initiative highlights what already exists in Utah and raises it. The aim is a higher bar for innovation and entrepreneurship, here and elsewhere.";

export const INTAKE_CTA = "Build my Opportunity Map";

export const INTAKE_TEST_CASES_OR = "Or open a test company";

export const INTAKE_ROLE_FOUNDER = "I'm a founder";

export const INTAKE_ROLE_INVESTOR = "I'm an investor";

export const INTAKE_ROLE_WORK = "I'm looking for work";

export const JOURNEY_EYEBROW = "Where are you in the journey?";

export const JOURNEY_TITLE = "Resources for every stage of building a Utah company.";

export const JOURNEY_LEAD =
  "The state organizes its support around four lifecycle moments. Pick yours below, or describe your business above and we'll send you to the right step.";

export const MAP_NAV_LABEL = "Opportunities";

export const MAP_EMPTY_LEAD =
  "The map ranks retrieved federal and Utah programs against one company. Tell us about your company first, or open one of the test companies above.";

export const MAP_EMPTY_CTA = "Go to Intake";

export const FLOOR_EYEBROW = "Read this first";

export const FLOOR_FOLLOW =
  "The federal listings retrieved for this company stay in the set below with their Fit and concerns. Nothing is hidden.";

export const WHY_HEADING = "Why this listing, for this company";

export const VERIFY_HEADING = "Verify";

export const SIMILAR_HEADING = "Similar awards";

export const RETRIEVE_HEADING = "Retrieve";

export const RETRIEVE_HELP =
  "Changes which official listings are collected, then ranks them again.";

export const FIT_HEADING = "Fit";

export const FIT_HELP =
  "Narrows the ranked set already on the page. No new search.";

export const DIRECTORY_LABEL = "Include GOED directory";

export const DIRECTORY_HELP =
  "About 180 leftover rows. Retrieve stays capped near 50 ids.";

export const FLOOR_BANNER =
  "Traditional federal grants look like a poor fit for this company. Utah programs below are the stronger place to start.";

export const NOT_PUBLISHED = "Not published";

export const NONE_ATTACHED = "None attached";

export const PADDED_CARD_WHY =
  "This program was retrieved for this company. Confirm fit on the official listing.";

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
  "Sign up for our monthly newsletter to learn more about GOED programs and ecosystem activity.";
export const FOOTER_NEWSLETTER_CTA = "Subscribe to Newsletter";
export const FOOTER_GOED_NAME =
  "Utah Governor's Office of Economic Development (GOED)";
export const FOOTER_GOED_ADDRESS_1 = "60 East South Temple, Suite 300";
export const FOOTER_GOED_ADDRESS_2 = "Salt Lake City, Utah 84111-1041";
export const FOOTER_EMAIL = "business@utah.gov";
export const FOOTER_NEWSLETTER_URL =
  "https://cdn.forms-content.sg-form.com/06b418c5-1057-11ee-9a80-ca5180dad175";
export const WELCOME_BACK_BANNER =
  "Welcome back. We saved your last Opportunity Map.";
export const WELCOME_BACK_ACTION = "Open last Opportunity Map";
export const ASK_FAB_LABEL = "Ask the Navigator";
export const ASK_PANEL_LEAD =
  "Ask about your Opportunity Map, the Utah playbook, or GOED programs.";
export const ASK_NEEDS_MAP = "Type a question for the Navigator.";
export const ASK_PLACEHOLDER = "What should I do first?";
