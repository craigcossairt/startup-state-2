export type OpportunitySource = "grants_gov" | "goeo" | "curated";

export type Instrument =
  | "grant"
  | "loan"
  | "incentive"
  | "counseling"
  | "contracting_help"
  | "procurement"
  | "other";

export type OpportunityStatus = "posted" | "forecasted" | "standing";

export type FitLabel =
  | "likely"
  | "potential-verify"
  | "adjacent"
  | "probably_not";

export type Opportunity = {
  id: `${OpportunitySource}:${string}`;
  source: OpportunitySource;
  nativeId: string;
  opportunityNumber?: string;
  lane: "federal" | "state";
  jurisdiction: "UT" | null;
  instrument: Instrument;
  status: OpportunityStatus;
  program: string;
  agency: { name: string; code?: string };
  value: { minUsd: number; maxUsd: number } | null;
  deadline: string | null;
  url: string | null;
  aln: string[];
  description: string | null;
  applicantTypes?: string[];
  applicantNote?: string;
};

export type HistoryAttachment = {
  source: "usaspending" | "sbir_csv";
  name: string;
  amountUsd?: number;
  year?: number;
  state?: string;
  city?: string;
  summary?: string;
  url?: string;
};

export type RankedCard = {
  opportunity: Opportunity;
  fit: FitLabel;
  why: string;
  concerns: string[];
  nextStep: { label: string; url?: string };
  similarAwardees: HistoryAttachment[];
};

export type RankModelCard = {
  id: string;
  fit: FitLabel;
  why: string;
  concerns: string[];
  nextStep: { label: string; url?: string };
};

export type GoeoKey =
  | "sbir-help"
  | "contracting"
  | "state-capital"
  | "workforce"
  | "counseling"
  | "trade";

export type RetrieveChips = {
  lane?: "federal" | "state";
  extraGoeoKeys?: GoeoKey[];
  includeDirectory?: boolean;
};

export type OpportunityMapPayload = {
  cards: RankedCard[];
  floorTripped: boolean;
  floorBanner: string | null;
  retrievedIds: string[];
  firedKeys: GoeoKey[];
};
