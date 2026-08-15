import type { PlaybookStageCard, PlaybookStageSlug, PlaybookStep } from "./types";

export const PLAYBOOK_STAGES: PlaybookStageCard[] = [
  {
    slug: "thinking-of-starting",
    label: "Thinking of starting",
    shortLabel: "Thinking",
    accent: "#FFAD00",
    lead: "Test the idea before you file anything.",
  },
  {
    slug: "starting",
    label: "Starting my business",
    shortLabel: "Starting",
    accent: "#13DF81",
    lead: "Register, fund, and stand up day-to-day operations.",
  },
  {
    slug: "growing",
    label: "Growing my business",
    shortLabel: "Growing",
    accent: "#00A24C",
    lead: "Hire, sell to government, and expand past the first market.",
  },
  {
    slug: "closing",
    label: "Closing or selling",
    shortLabel: "Closing",
    accent: "#8E32F5",
    lead: "Wind down or transfer the company the official way.",
  },
];

export const PLAYBOOK_STEPS: PlaybookStep[] = [
  {
    stepId: "find-idea",
    stage: "thinking-of-starting",
    stepIndex: 1,
    title: "Find your big idea",
    sourceUrl: "https://startup.utah.gov/find-idea/",
    summary:
      "Pick a problem you can stay with. Talk to buyers before you name the company.",
    whatYouDo: [
      "Write the problem in one sentence a stranger can repeat.",
      "Talk to ten people who already pay to solve it.",
      "Keep or kill the idea from those notes, not from a logo.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/find-idea/" },
      { label: "Utah SBDC counseling", url: "https://www.utahsbdc.org/" },
    ],
    resourceTopics: ["Start a Business", "Entrepreneurship Communities"],
  },
  {
    stepId: "business-skills",
    stage: "thinking-of-starting",
    stepIndex: 2,
    title: "Important business skills",
    sourceUrl: "https://startup.utah.gov/business-skills/",
    summary:
      "Learn the skills you will need on day one: selling, cash, and asking for help.",
    whatYouDo: [
      "List the skills you have and the ones you will borrow.",
      "Book a free counseling hour before you spend on a course.",
      "Practice a two-minute pitch with someone outside your field.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/business-skills/" },
      { label: "SCORE mentors", url: "https://www.score.org/" },
    ],
    resourceTopics: ["Start a Business", "Entrepreneurship Communities"],
  },
  {
    stepId: "business-validation",
    stage: "starting",
    stepIndex: 1,
    title: "Business validation",
    sourceUrl: "https://startup.utah.gov/business-validation/",
    summary:
      "Prove someone will pay. A survey is not a sale.",
    whatYouDo: [
      "Collect a paid preorder, a letter of intent, or a pilot date.",
      "Write the smallest offer you can deliver this month.",
      "Drop features nobody asked to buy.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/business-validation/" },
    ],
    resourceTopics: ["Start a Business", "Marketing and Sales"],
  },
  {
    stepId: "build-product",
    stage: "starting",
    stepIndex: 2,
    title: "Build your product or service",
    sourceUrl: "https://startup.utah.gov/build-product/",
    summary:
      "Ship the smallest version that solves the paid problem.",
    whatYouDo: [
      "Define done as a customer using it, not a feature list.",
      "Use Utah MEP or a maker space if you need hardware help.",
      "Write the support path before the launch post.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/build-product/" },
      { label: "Utah MEP", url: "https://www.utahmep.org/" },
    ],
    resourceTopics: ["Start a Business", "Late Stage Growth"],
  },
  {
    stepId: "develop-brand",
    stage: "starting",
    stepIndex: 3,
    title: "Develop your brand and marketing strategy",
    sourceUrl: "https://startup.utah.gov/develop-brand/",
    summary:
      "Name who you serve and where they already look. Then pick a mark.",
    whatYouDo: [
      "Write the one sentence a buyer should remember.",
      "Check the name against Utah business search before you print.",
      "Pick one channel you can keep for 90 days.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/develop-brand/" },
      { label: "Utah business search", url: "https://businessregistration.utah.gov/" },
    ],
    resourceTopics: ["Marketing and Sales"],
  },
  {
    stepId: "business-plan-step",
    stage: "starting",
    stepIndex: 4,
    title: "Write your business plan",
    sourceUrl: "https://startup.utah.gov/business-plan-step/",
    summary:
      "A plan is a cash and customer story. Keep it short enough to update.",
    whatYouDo: [
      "Write who pays, how much, and when cash hits the bank.",
      "List the next three hires only if revenue needs them.",
      "Take the draft to an SBDC counselor before a lender meeting.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/business-plan-step/" },
      { label: "SBA business plan guide", url: "https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan" },
    ],
    resourceTopics: ["Start a Business", "Funding"],
  },
  {
    stepId: "registration",
    stage: "starting",
    stepIndex: 5,
    title: "Registration and licensure",
    sourceUrl: "https://startup.utah.gov/registration/",
    summary:
      "File the entity, get an EIN, and check city and state licenses.",
    whatYouDo: [
      "Choose an entity with a CPA or counselor, not a blog post.",
      "Register with the Utah Division of Corporations.",
      "Ask the city if a business license or home-occupation permit applies.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/registration/" },
      { label: "Utah business registration", url: "https://businessregistration.utah.gov/" },
      { label: "IRS EIN", url: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" },
    ],
    resourceTopics: ["Start a Business"],
  },
  {
    stepId: "business-operations",
    stage: "starting",
    stepIndex: 6,
    title: "Establish business operations",
    sourceUrl: "https://startup.utah.gov/business-operations/",
    summary:
      "Open the bank account, set books, and write how work gets done.",
    whatYouDo: [
      "Open a business bank account with the filed documents.",
      "Pick bookkeeping you will actually update each week.",
      "Write the one-page ops list: who invoices, who pays, who ships.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/business-operations/" },
    ],
    resourceTopics: ["Start a Business"],
  },
  {
    stepId: "fund-small-business",
    stage: "starting",
    stepIndex: 7,
    title: "Obtain funding",
    sourceUrl: "https://startup.utah.gov/fund-small-business/",
    summary:
      "Match the instrument to the job. Grants, loans, and equity are not interchangeable.",
    whatYouDo: [
      "Rank a company on the Opportunity Map before you chase a grant.",
      "Ask USBCI or a microlender only when you can repay.",
      "Treat friends-and-family cash as a contract, not a favor.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/fund-small-business/" },
      { label: "Opportunity Map", url: "/map" },
    ],
    resourceTopics: ["Funding"],
  },
  {
    stepId: "find-space",
    stage: "starting",
    stepIndex: 8,
    title: "Find office space",
    sourceUrl: "https://startup.utah.gov/find-space/",
    summary:
      "Start cheaper than you think. A lease is easier to grow into than to exit.",
    whatYouDo: [
      "List must-haves: zoning, parking, wet lab, or just a lockable room.",
      "Tour a coworking space or incubator before a five-year lease.",
      "Read the personal guarantee line twice.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/find-space/" },
    ],
    resourceTopics: ["Entrepreneurship Communities"],
  },
  {
    stepId: "pay-taxes",
    stage: "starting",
    stepIndex: 9,
    title: "Pay your taxes",
    sourceUrl: "https://startup.utah.gov/pay-taxes/",
    summary:
      "Sales tax, withholding, and income tax have different clocks. Miss one and the others get harder.",
    whatYouDo: [
      "Ask a CPA which Utah taxes apply to this offer.",
      "Register with the Tax Commission before the first taxable sale.",
      "Put filing dates on a calendar the week you open the bank account.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/pay-taxes/" },
      { label: "Utah Tax Commission", url: "https://tax.utah.gov/" },
    ],
    resourceTopics: ["Start a Business"],
  },
  {
    stepId: "join-community",
    stage: "growing",
    stepIndex: 1,
    title: "Join a community",
    sourceUrl: "https://startup.utah.gov/join-community/",
    summary:
      "Pick one room you will keep showing up in. Networks compound. Events do not.",
    whatYouDo: [
      "Join a sector group or a founder circle near your city.",
      "Offer help once before you ask for an intro.",
      "Put a recurring event on the calendar so it survives busy weeks.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/join-community/" },
    ],
    resourceTopics: ["Entrepreneurship Communities"],
  },
  {
    stepId: "growth-funding",
    stage: "growing",
    stepIndex: 2,
    title: "Growth-stage funding",
    sourceUrl: "https://startup.utah.gov/growth-funding/",
    summary:
      "Growth money buys a plan you can already run. It does not invent the plan.",
    whatYouDo: [
      "Show trailing revenue and the next hire the round pays for.",
      "Compare state capital, bank debt, and equity on dilution and speed.",
      "Use the Opportunity Map for public programs that still fit.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/growth-funding/" },
      { label: "Opportunity Map", url: "/map" },
    ],
    resourceTopics: ["Funding", "Late Stage Growth"],
  },
  {
    stepId: "strategic-planning",
    stage: "growing",
    stepIndex: 3,
    title: "Strategic planning for growth",
    sourceUrl: "https://startup.utah.gov/strategic-planning/",
    summary:
      "Write the next 12 months as a few bets, not a vision slide.",
    whatYouDo: [
      "Name the one market you will not serve this year.",
      "Set three numbers the leadership team reviews every month.",
      "Kill a project that does not move those numbers.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/strategic-planning/" },
    ],
    resourceTopics: ["Late Stage Growth"],
  },
  {
    stepId: "workforce",
    stage: "growing",
    stepIndex: 4,
    title: "Workforce and talent acquisition",
    sourceUrl: "https://startup.utah.gov/workforce/",
    summary:
      "Hire for the next bottleneck. Training programs can pay part of the cost.",
    whatYouDo: [
      "Write the role as outcomes, not a tool list.",
      "Ask Talent Ready Utah or Custom Fit before you post.",
      "Flag the company as hiring so the Careers page can show it.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/workforce/" },
      { label: "Talent Ready Utah", url: "https://talentready.utah.gov/" },
      { label: "Careers on this site", url: "/careers" },
    ],
    resourceTopics: ["Late Stage Growth"],
  },
  {
    stepId: "government-contracts-2",
    stage: "growing",
    stepIndex: 5,
    title: "Obtain government contracts",
    sourceUrl: "https://startup.utah.gov/government-contracts-2/",
    summary:
      "Register, then pick one buyer. A complete SAM profile is not a pipeline.",
    whatYouDo: [
      "Finish SAM.gov registration before you chase a solicitation.",
      "Call the Utah APEX Accelerator with one NAICS code.",
      "Rank federal and Utah programs on the Opportunity Map.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/government-contracts-2/" },
      { label: "SAM.gov", url: "https://sam.gov/" },
      { label: "Opportunity Map", url: "/map" },
    ],
    resourceTopics: ["Government Contracting"],
  },
  {
    stepId: "international-trade-2",
    stage: "growing",
    stepIndex: 6,
    title: "International trade",
    sourceUrl: "https://startup.utah.gov/international-trade-2/",
    summary:
      "Export is a second go-to-market. Start with one country and one partner.",
    whatYouDo: [
      "Call World Trade Center Utah with the product and the target country.",
      "Check export controls before you send a demo unit.",
      "Price freight and duties into the first quote.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/international-trade-2/" },
      { label: "World Trade Center Utah", url: "https://wtcutah.com/" },
    ],
    resourceTopics: ["International Trade"],
  },
  {
    stepId: "relocate-business",
    stage: "growing",
    stepIndex: 7,
    title: "Relocate your business to Utah",
    sourceUrl: "https://startup.utah.gov/relocate-business/",
    summary:
      "Utah can be a second site or a new HQ. Bring the jobs number and the timeline.",
    whatYouDo: [
      "Call GOED with headcount, sector, and the quarter you would move.",
      "Compare EDTIF and local incentives against the real lease math.",
      "Register the Utah entity before you hire here.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/relocate-business/" },
      { label: "GOED", url: "https://business.utah.gov/" },
    ],
    resourceTopics: ["Late Stage Growth", "Funding"],
  },
  {
    stepId: "close-business",
    stage: "closing",
    stepIndex: 1,
    title: "Close your business",
    sourceUrl: "https://startup.utah.gov/close-business/",
    summary:
      "Closing is a sequence: tax, workers, then the entity. Skipping a step leaves the name dirty.",
    whatYouDo: [
      "File final tax returns and close withholding accounts.",
      "Pay workers and vendors, then dissolve with Corporations.",
      "Keep records for the years the Tax Commission still can ask.",
    ],
    officialLinks: [
      { label: "Official step on startup.utah.gov", url: "https://startup.utah.gov/close-business/" },
      { label: "Utah business registration", url: "https://businessregistration.utah.gov/" },
    ],
    resourceTopics: ["Close or Exit a Business"],
  },
];

export function playbookStage(slug: string): PlaybookStageCard | undefined {
  return PLAYBOOK_STAGES.find((stage) => stage.slug === slug);
}

export function stepsForStage(slug: PlaybookStageSlug): PlaybookStep[] {
  return PLAYBOOK_STEPS.filter((step) => step.stage === slug).sort(
    (a, b) => a.stepIndex - b.stepIndex,
  );
}

export function playbookStep(
  stage: string,
  stepId: string,
): PlaybookStep | undefined {
  return PLAYBOOK_STEPS.find((step) => step.stage === stage && step.stepId === stepId);
}

export function adjacentPlaybookSteps(
  stage: string,
  stepId: string,
): { prev: { stepId: string; title: string } | null; next: { stepId: string; title: string } | null } {
  const steps = PLAYBOOK_STEPS.filter((step) => step.stage === stage).sort(
    (a, b) => a.stepIndex - b.stepIndex,
  );
  const index = steps.findIndex((step) => step.stepId === stepId);
  const prev = index > 0 ? steps[index - 1] : null;
  const next = index >= 0 && index < steps.length - 1 ? steps[index + 1] : null;
  return {
    prev: prev ? { stepId: prev.stepId, title: prev.title } : null,
    next: next ? { stepId: next.stepId, title: next.title } : null,
  };
}

export function stepCountByStage(): Record<PlaybookStageSlug, number> {
  return {
    "thinking-of-starting": stepsForStage("thinking-of-starting").length,
    starting: stepsForStage("starting").length,
    growing: stepsForStage("growing").length,
    closing: stepsForStage("closing").length,
  };
}
