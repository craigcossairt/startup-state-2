import { NextResponse } from "next/server";
import { bonusSurfaces } from "@/lib/bonus/surfaces";
import type { RankedCard } from "@/lib/types/opportunity";

export async function POST(request: Request) {
  const body = (await request.json()) as { cards?: RankedCard[] };
  if (!body.cards) {
    return NextResponse.json({ error: "cards are required" }, { status: 400 });
  }
  return NextResponse.json(bonusSurfaces(body.cards));
}
