const ID_PATTERN = /\b((?:grants_gov|goeo|curated|sam_opps):[A-Za-z0-9._-]+)\b/g;

export function extractCitedIds(text: string): string[] {
  return [...text.matchAll(ID_PATTERN)].map((match) => match[1]);
}

export function refuseUnknownProgramIds(
  citedIds: string[],
  rankedIds: Iterable<string>,
): string[] {
  const allowed = new Set(rankedIds);
  return citedIds.filter((id) => !allowed.has(id));
}

export function followUpChat(input: {
  message: string;
  rankedIds: string[];
  cardSummaries: Array<{ id: string; program: string; why: string }>;
}): { reply: string; refused: string[] } {
  const cited = extractCitedIds(input.message);
  const refused = refuseUnknownProgramIds(cited, input.rankedIds);
  if (refused.length > 0) {
    return {
      refused,
      reply: `I can only talk about programs on this Opportunity Map. ${refused.join(", ")} is not a retrieved id.`,
    };
  }
  const byId = new Map(input.cardSummaries.map((card) => [card.id, card]));
  const mentioned = cited.map((id) => byId.get(id)).filter(Boolean);
  if (mentioned.length > 0) {
    return {
      refused: [],
      reply: mentioned
        .map((card) => `${card!.program}: ${card!.why}`)
        .join(" "),
    };
  }
  return {
    refused: [],
    reply: input.cardSummaries
      .slice(0, 3)
      .map((card) => card.program)
      .join("; "),
  };
}
