import { MUST_HAVE_KEYS, type MustHaveKey } from "@/lib/types/company-profile";

export const MUST_HAVE_COPY: Record<MustHaveKey, { label: string; hint: string }> = {
  whatTheyDo: {
    label: "What they do",
    hint: "One to three sentences about the company. We use this as the main search text.",
  },
  technologies: {
    label: "Technologies",
    hint: "Search and pick, or type a new token and add it. Spaces are allowed.",
  },
  sectors: {
    label: "Sectors",
    hint: "Pick every market you sell into. The list is fixed for this demo.",
  },
  hqCountry: {
    label: "Country",
    hint: "Country where the company is based.",
  },
  hqState: {
    label: "State",
    hint: "US state. Utah is common here; any state works.",
  },
  employeeCount: {
    label: "Employees",
    hint: "Exact headcount. One number is enough.",
  },
  revenue: {
    label: "Revenue",
    hint: "Annual revenue in US dollars. If you report ARR, enter that number.",
  },
  capitalRaisedUsd: {
    label: "Capital raised",
    hint: "Equity and convertibles only. Leave out debt and grants.",
  },
  capitalNeedUsd: {
    label: "Capital need",
    hint: "Target raise in US dollars. One number is stored as a min-max pair.",
  },
  useOfFunds: {
    label: "Use of funds",
    hint: "What the next money pays for. Pick all that apply.",
  },
};

export const MUST_HAVE_LABELS = Object.fromEntries(
  MUST_HAVE_KEYS.map((key) => [key, MUST_HAVE_COPY[key].label]),
) as Record<MustHaveKey, string>;
