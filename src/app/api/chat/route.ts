import { NextResponse } from "next/server";
import { followUpChat } from "@/lib/bonus/chat";
import type { RankedCard } from "@/lib/types/opportunity";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    cards?: RankedCard[];
  };
  if (!body.message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  const cards = body.cards ?? [];
  const result = followUpChat({
    message: body.message,
    rankedIds: cards.map((card) => card.opportunity.id),
    cardSummaries: cards.map((card) => ({
      id: card.opportunity.id,
      program: card.opportunity.program,
      why: card.why,
    })),
  });
  return NextResponse.json(result);
}
