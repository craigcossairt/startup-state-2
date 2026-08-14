import type {
  FitLabel,
  HistoryAttachment,
  Opportunity,
  RankedCard,
} from "@/lib/types/opportunity";

export function ranked(partial: {
  id: string;
  fit?: FitLabel;
  agency?: string;
  aln?: string[];
  deadline?: string | null;
  status?: Opportunity["status"];
  nextStep?: { label: string; url?: string };
  url?: string | null;
  similarAwardees?: HistoryAttachment[];
  program?: string;
}): RankedCard {
  const [source, nativeId] = partial.id.split(":") as [Opportunity["source"], string];
  return {
    opportunity: {
      id: partial.id as Opportunity["id"],
      source,
      nativeId,
      lane: source === "grants_gov" || source === "sam_opps" ? "federal" : "state",
      jurisdiction: source === "grants_gov" || source === "sam_opps" ? null : "UT",
      instrument: "grant",
      status: partial.status ?? "posted",
      program: partial.program ?? partial.id,
      agency: { name: partial.agency ?? "Agency" },
      value: null,
      deadline: partial.deadline === undefined ? null : partial.deadline,
      url: partial.url ?? null,
      aln: partial.aln ?? [],
      description: null,
    },
    fit: partial.fit ?? "adjacent",
    why: "why",
    concerns: [],
    nextStep: partial.nextStep ?? { label: "Open", url: partial.url ?? undefined },
    similarAwardees: partial.similarAwardees ?? [],
  };
}
