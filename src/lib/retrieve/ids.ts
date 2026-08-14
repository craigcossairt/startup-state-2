import type { Opportunity, OpportunitySource } from "@/lib/types/opportunity";

export function mintOpportunityId(
  source: OpportunitySource,
  nativeId: string,
): Opportunity["id"] {
  return `${source}:${nativeId}`;
}
