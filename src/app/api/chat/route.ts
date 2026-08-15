import { NextResponse } from "next/server";
import { followUpChat } from "@/lib/bonus/chat";
import type { AskCardSummary, AskSurface } from "@/lib/ask-panel";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    surface?: AskSurface;
    cards?: AskCardSummary[] | Array<{ opportunity?: { id?: string; program?: string }; why?: string }>;
  };
  if (!body.message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  const cards = (body.cards ?? []).map((card) => {
    if ("id" in card && typeof card.id === "string") {
      return {
        id: card.id,
        program: typeof card.program === "string" ? card.program : "",
        why: typeof card.why === "string" ? card.why : "",
      };
    }
    return {
      id: card.opportunity?.id ?? "",
      program: card.opportunity?.program ?? "",
      why: card.why ?? "",
    };
  });
  const result = followUpChat({
    message: body.message,
    surface: body.surface,
    rankedIds: cards.map((card) => card.id).filter(Boolean),
    cardSummaries: cards,
  });
  return NextResponse.json(result);
}
