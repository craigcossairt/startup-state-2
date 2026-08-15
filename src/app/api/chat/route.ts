import { NextResponse } from "next/server";
import { followUpChat } from "@/lib/bonus/chat";
import { normalizeAskCards, type AskSurface } from "@/lib/ask-panel";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    surface?: AskSurface;
    cards?: unknown[];
  };
  if (!body.message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  const cards = normalizeAskCards(body.cards ?? []);
  const result = followUpChat({
    message: body.message,
    surface: body.surface,
    rankedIds: cards.map((card) => card.id).filter(Boolean),
    cardSummaries: cards,
  });
  return NextResponse.json(result);
}
